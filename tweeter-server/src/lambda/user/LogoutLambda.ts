import { AuthTokenDto, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { AuthService } from "../../model/service/AuthService";
import { handleLambdaError } from "../handleLambdaError";

export const handler = async (request: {
  token: AuthTokenDto;
}): Promise<TweeterResponse> => {
  try {
    const factory = new DynamoDaoFactory();
    const authService = new AuthService(factory);
    await authService.auth(request.token);

    const userService = new UserService(factory);
    await userService.logout(request.token);

    return {
      success: true,
      message: null,
    };
  } catch (error) {
    handleLambdaError(error);
  }
};
