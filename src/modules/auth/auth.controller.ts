import type { Context } from "hono";
import type { Session } from "hono-sessions";
import { env } from "@/config/env";
import responseHandler from "@/helpers/response";
import authService from "@/modules/auth/auth.service";
import {
  type AuthLoginSchema,
  type AuthRegisterSchema,
  authLoginSchema,
  authRegisterSchema,
  type ForgotPasswordSchema,
  forgotPasswordSchema,
  type ResendVerificationSchema,
  type ResetPasswordSchema,
  resendVerificationSchema,
  resetPasswordSchema,
} from "@/modules/auth/auth.validation";
import { type JwtPayload, RESPONSE_CODES, type SessionData } from "@/types";

class AuthController {
  private static _instance: AuthController;
  private readonly authService: typeof authService;
  private readonly responseHandler: typeof responseHandler;

  private constructor() {
    this.authService = authService;
    this.responseHandler = responseHandler;
  }

  static get instance() {
    if (!AuthController._instance) {
      AuthController._instance = new AuthController();
    }
    return AuthController._instance;
  }

  register = async (c: Context) => {
    const body = await c.req.json<AuthRegisterSchema>();
    const data = authRegisterSchema.parse(body);
    const result = await this.authService.register(data);
    return this.responseHandler.success(
      c,
      "User registered successfully",
      result,
      RESPONSE_CODES.SUCCESS,
      201,
    );
  };

  verify = async (c: Context) => {
    const auth = c.get("auth") as JwtPayload;
    await this.authService.verify(auth);
    return this.responseHandler.success(
      c,
      "Account successfully verified",
      undefined,
      RESPONSE_CODES.SUCCESS,
      200,
    );
  };

  login = async (c: Context) => {
    const body = await c.req.json<AuthLoginSchema>();
    const data = authLoginSchema.parse(body);
    const result = await this.authService.login(data);
    const session = c.get("session") as Session<SessionData>;
    session.set("user", result);
    return this.responseHandler.success(
      c,
      "Login successfully",
      undefined,
      RESPONSE_CODES.SUCCESS,
      200,
    );
  };

  logout = async (c: Context) => {
    const session = c.get("session") as Session<SessionData>;
    session.deleteSession();
    return this.responseHandler.success(
      c,
      "Logout successfully",
      undefined,
      RESPONSE_CODES.SUCCESS,
      200,
    );
  };

  me = async (c: Context) => {
    const session = c.get("session") as Session<SessionData>;
    const user = session.get("user");
    if (!user) {
      return this.responseHandler.error(
        c,
        "Unauthorized",
        RESPONSE_CODES.UNAUTHORIZED,
        401,
      );
    }
    return this.responseHandler.success(
      c,
      "User profile",
      user,
      RESPONSE_CODES.SUCCESS,
      200,
    );
  };

  resendVerification = async (c: Context) => {
    const body = await c.req.json<ResendVerificationSchema>();
    const data = resendVerificationSchema.parse(body);
    const result = await this.authService.resendVerification(data);
    return this.responseHandler.success(
      c,
      "Verification email sent. Please check your inbox",
      result,
      RESPONSE_CODES.SUCCESS,
      200,
    );
  };

  forgotPassword = async (c: Context) => {
    const body = await c.req.json<ForgotPasswordSchema>();
    const data = forgotPasswordSchema.parse(body);
    const result = await this.authService.forgotPassword(data);
    return this.responseHandler.success(
      c,
      "Please check your email to reset your password",
      result,
      RESPONSE_CODES.SUCCESS,
      200,
    );
  };

  resetPassword = async (c: Context) => {
    const body = await c.req.json<ResetPasswordSchema>();
    const auth = c.get("auth") as JwtPayload;
    const result = resetPasswordSchema.parse(body);
    await this.authService.resetPassword(auth, result);
    return this.responseHandler.success(
      c,
      "Password successfully reset",
      undefined,
      RESPONSE_CODES.SUCCESS,
      200,
    );
  };
}

const authController = AuthController.instance;
export default authController;
