import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView {
  setIsLoading: (isLoading: boolean) => void;
  setIsFollower: (isFollower: boolean) => void;
  setFollowerCount: (followerCount: number) => void;
  setFolloweeCount: (followeeCount: number) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
  private followService = new FollowService();

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ) {
    await this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.followService.getIsFollowerStatus(
            authToken,
            displayedUser,
            currentUser,
          ),
        );
      }
    }, "determine follower status");
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    this.doFailureReportingOperation(async () => {
      this.view.setFolloweeCount(
        await this.followService.getFolloweeCount(authToken, displayedUser),
      );
    }, "get followees count");
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    this.doFailureReportingOperation(async () => {
      this.view.setFollowerCount(
        await this.followService.getFollowerCount(authToken, displayedUser),
      );
    }, "get followers count");
  }

  public async followDisplayedUser(
    event: React.MouseEvent,
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ): Promise<void> {
    event.preventDefault();
    await this.doFailureReportingOperation(async () => {
      await this.doFollowOperation(
        async () => {
          return this.followService.follow(
            authToken,
            currentUser,
            displayedUser,
          );
        },
        "Following",
        displayedUser,
        this.view,
      );
    }, "follow user");
  }

  public async unfollowDisplayedUser(
    event: React.MouseEvent,
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ): Promise<void> {
    event.preventDefault();
    await this.doFailureReportingOperation(async () => {
      await this.doFollowOperation(
        async () => {
          return this.followService.unfollow(
            authToken,
            currentUser,
            displayedUser,
          );
        },
        "Unfollowing",
        displayedUser,
        this.view,
      );
    }, "unfollow user");
  }
}
