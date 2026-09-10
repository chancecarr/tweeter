import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class FollowService implements Service {
  private serverFacade: ServerFacade;

  constructor() {
    this.serverFacade = ServerFacade.getInstance();
  }

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null,
  ): Promise<[User[], boolean]> {
    return await this.serverFacade.getMoreFollowees({
      token: authToken.dto,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    });
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null,
  ): Promise<[User[], boolean]> {
    return await this.serverFacade.getMoreFollowers({
      token: authToken.dto,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    });
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User,
  ): Promise<boolean> {
    return await this.serverFacade.getFollowStatus({
      token: authToken.dto,
      user: user.dto,
      selectedUser: selectedUser.dto,
    });
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User,
  ): Promise<number> {
    return await this.serverFacade.getFolloweeCount({
      token: authToken.dto,
      user: user.dto,
    });
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User,
  ): Promise<number> {
    return await this.serverFacade.getFollowerCount({
      token: authToken.dto,
      user: user.dto,
    });
  }

  public async follow(
    authToken: AuthToken,
    user: User,
    userToFollow: User,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.serverFacade.follow({
      token: authToken.dto,
      user: user.dto,
      followActionTarget: userToFollow.dto,
    });
  }

  public async unfollow(
    authToken: AuthToken,
    user: User,
    userToUnfollow: User,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.serverFacade.unfollow({
      token: authToken.dto,
      user: user.dto,
      followActionTarget: userToUnfollow.dto,
    });
  }
}
