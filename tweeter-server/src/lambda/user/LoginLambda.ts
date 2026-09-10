import { LoginRequest, LoginResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";

export const handler = async (
  request: LoginRequest,
): Promise<LoginResponse> => {
  try {
    const factory = new DynamoDaoFactory();

    const userService = new UserService(factory);
    const [user, authToken] = await userService.login(
      request.alias,
      request.password,
    );

    return {
      success: true,
      message: null,
      user: user,
      authToken: authToken,
    };
  } catch (error) {
    handleLambdaError(error);
  }
};
