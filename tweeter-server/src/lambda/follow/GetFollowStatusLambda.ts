import { UserRequest, BooleanResponse, UserDto } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";
import { AuthService } from "../../model/service/AuthService";

export const handler = async (
  request: UserRequest & { selectedUser: UserDto },
): Promise<BooleanResponse> => {
  try {
    const factory = new DynamoDaoFactory();
    const authService = new AuthService(factory);
    authService.auth(request.token);

    const followService = new FollowService(factory);
    const isFollower = await followService.getIsFollowerStatus(
      request.user,
      request.selectedUser,
    );

    return {
      success: true,
      message: null,
      booleanResult: isFollower,
    };
  } catch (error) {
    handleLambdaError(error);
  }
};
