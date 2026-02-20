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
        message:
          "This account was created via Google and has no password. Please use 'Forgot Password' to set one.",
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
