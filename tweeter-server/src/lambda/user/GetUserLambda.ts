import { AuthTokenDto, TweeterResponse, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { AuthService } from "../../model/service/AuthService";
import { handleLambdaError } from "../handleLambdaError";

export const handler = async (request: {
  token: AuthTokenDto;
  alias: string;
}): Promise<TweeterResponse & { user: UserDto | null }> => {
  try {
    const factory = new DynamoDaoFactory();
    const authService = new AuthService(factory);
    await authService.auth(request.token);

    const userService = new UserService(factory);
    const user = await userService.getUser(request.alias);

    return {
      success: true,
      message: null,
      user: user,
    };
  } catch (error) {
    handleLambdaError(error);
  }
};
