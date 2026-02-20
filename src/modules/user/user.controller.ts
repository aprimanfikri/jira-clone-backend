import type { Context } from "hono";
import responseHandler from "@/helpers/response";
import userRepository from "@/modules/user/user.repository";
import { RESPONSE_CODES } from "@/types";

class UserController {
  private static _instance: UserController;
  private readonly userRepository: typeof userRepository;
  private readonly responseHandler: typeof responseHandler;

  private constructor() {
    this.userRepository = userRepository;
    this.responseHandler = responseHandler;
  }

  static get instance() {
    if (!UserController._instance) {
      UserController._instance = new UserController();
    }
    return UserController._instance;
  }

  getAll = async (c: Context) => {
    const result = await this.userRepository.findAll();
    return this.responseHandler.success(
      c,
      "Users retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };
}

const userController = UserController.instance;
export default userController;
