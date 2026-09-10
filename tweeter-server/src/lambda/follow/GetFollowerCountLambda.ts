import { NumberResponse, UserRequest } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";
import { AuthService } from "../../model/service/AuthService";

export const handler = async (
  request: UserRequest,
): Promise<NumberResponse> => {
  try {
    const factory = new DynamoDaoFactory();
    const authService = new AuthService(factory);
    authService.auth(request.token);

    const followService = new FollowService(factory);
    const followerCount = await followService.getFollowerCount(request.user);

    return {
      success: true,
      message: null,
      numberResult: followerCount,
    };
  } catch (error) {
    handleLambdaError(error);
  }
};
