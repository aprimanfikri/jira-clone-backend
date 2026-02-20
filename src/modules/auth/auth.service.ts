import { HTTPException } from "hono/http-exception";
import { env } from "@/config/env";
import type { User } from "@/database/schemas";
import bcryptHelper from "@/helpers/bcrypt";
import emailHelper from "@/helpers/email";
import tokenHelper from "@/helpers/token";
import authRepository from "@/modules/auth/auth.repository";
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/modules/auth/auth.validation";
import type { JwtPayload, PurposeType } from "@/types";
import { omitPassword, toLowercase } from "@/utils";

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

class AuthService {
  private static _instance: AuthService;
  private readonly authRepository: typeof authRepository;
  private readonly bcryptHelper: typeof bcryptHelper;
  private readonly emailHelper: typeof emailHelper;
  private readonly tokenHelper: typeof tokenHelper;

  private constructor() {
    this.authRepository = authRepository;
    this.bcryptHelper = bcryptHelper;
    this.emailHelper = emailHelper;
    this.tokenHelper = tokenHelper;
  }

  static get instance() {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService();
    }
    return AuthService._instance;
  }

  private async generateVerificationToken(
    user: User,
    purpose: PurposeType,
  ): Promise<string> {
    return await this.tokenHelper.generate({
      id: user.id,
      email: user.email,
      purpose,
    });
  }

  async register(body: AuthRegisterSchema) {
    const exist = await this.authRepository.findByEmail(body.email);
    if (exist) {
      throw new HTTPException(409, { message: "Email already exists" });
    }
    const hashedPassword = await this.bcryptHelper.hash(body.password);
    const user = await this.authRepository.create({
      ...body,
      password: hashedPassword,
    });

    const token = await this.generateVerificationToken(user, "verification");
    if (env.APP_ENV === "development") {
      return { token };
    }
    this.emailHelper.sendVerificationEmail(user.email, token);
    return;
  }

  async verify(auth: JwtPayload) {
    const user = await this.authRepository.findById(auth.id);
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    if (user.isEmailVerified) {
      throw new HTTPException(400, { message: "Email already verified" });
    }
    await this.authRepository.update(auth.id, { isEmailVerified: true });
    this.emailHelper.sendVerifiedEmail(user.email);
    return;
  }

  async login(body: AuthLoginSchema): Promise<Omit<User, "password">> {
    const user = await this.authRepository.findByEmail(body.email);
    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }
    if (!user.isEmailVerified) {
      throw new HTTPException(401, {
        message: "Email is not verified",
      });
    }
    if (!user.password) {
      throw new HTTPException(401, {
        message: "This account uses Google login. Please sign in with Google.",
      });
    }
    const isPasswordValid = await this.bcryptHelper.compare(
      body.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }
    return omitPassword(user);
  }

  async googleOAuth(code: string): Promise<Omit<User, "password">> {
    const redirectUri = `http://localhost:${env.PORT}/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Google token exchange error:", err);
      throw new HTTPException(400, {
        message: "Failed to exchange Google authorization code",
      });
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    // Fetch user info from Google
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    if (!userInfoRes.ok) {
      throw new HTTPException(400, {
        message: "Failed to fetch Google user info",
      });
    }

    const googleUser = (await userInfoRes.json()) as GoogleUserInfo;

    // 1. Try to find by googleId
    let user = await this.authRepository.findByGoogleId(googleUser.id);
    if (user) {
      return omitPassword(user);
    }

    // 2. Try to find by email — link the account
    const existingByEmail = await this.authRepository.findByEmail(
      googleUser.email,
    );
    if (existingByEmail) {
      user = await this.authRepository.update(existingByEmail.id, {
        googleId: googleUser.id,
        image: existingByEmail.image ?? googleUser.picture,
        isEmailVerified: true,
      });
      return omitPassword(user);
    }

    // 3. Create new user
    user = await this.authRepository.create({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.id,
      image: googleUser.picture,
      isEmailVerified: true,
    });

    return omitPassword(user);
  }

  async resendVerification(body: ForgotPasswordSchema) {
    const lower = toLowercase(body.email);
    const user = await this.authRepository.findByEmail(lower);
    if (!user || user.isEmailVerified) {
      return;
    }
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      purpose: "verification",
    };
    const token = await this.tokenHelper.generate(payload);
    if (env.APP_ENV === "development") {
      return { token };
    }
    this.emailHelper.sendVerificationEmail(user.email, token);
    return;
  }

  async forgotPassword(body: ForgotPasswordSchema) {
    const email = toLowercase(body.email);
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      return;
    }
    if (!user.isEmailVerified) {
      throw new HTTPException(400, {
        message: "Email is not verified",
      });
    }
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      purpose: "reset-password",
    };
    const token = await this.tokenHelper.generate(payload);
    if (env.APP_ENV === "development") {
      return { token };
    }
    this.emailHelper.sendResetPasswordEmail(user.email, token);
    return;
  }

  async resetPassword(auth: JwtPayload, body: ResetPasswordSchema) {
    if (body.password !== body.confirmPassword) {
      throw new HTTPException(400, { message: "Passwords do not match" });
    }
    const user = await this.authRepository.findById(auth.id);
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    const hash = await this.bcryptHelper.hash(body.password);
    await this.authRepository.update(user.id, { password: hash });
    this.emailHelper.sendResetSuccessEmail(user.email);
    return;
  }
}

const authService = AuthService.instance;
export default authService;
