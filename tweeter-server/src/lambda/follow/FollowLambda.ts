import { FollowRequest, FollowResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";
import { AuthService } from "../../model/service/AuthService";

export const handler = async (
  request: FollowRequest,
): Promise<FollowResponse> => {
  try {
    const factory = new DynamoDaoFactory();
    const authService = new AuthService(factory);
    authService.auth(request.token);

    const followService = new FollowService(factory);
    const [followerCount, followeeCount] = await followService.follow(
      request.user,
      request.followActionTarget,
    );

    return {
      success: true,
      message: null,
      followerCount: followerCount,
      followeeCount: followeeCount,
    };
  } catch (error) {
    handleLambdaError(error);
  }
};
