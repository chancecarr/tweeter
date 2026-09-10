import { LoginResponse, RegisterRequest, User } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";

export const handler = async (
  request: RegisterRequest,
): Promise<LoginResponse> => {
  try {
    const factory = new DynamoDaoFactory();

    const userService = new UserService(factory);
    const [user, authToken] = await userService.register(
      request.firstName,
      request.lastName,
      request.alias,
      request.password,
      request.userImageBytes,
      request.imageFileExtension,
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
