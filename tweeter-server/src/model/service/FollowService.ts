import { User, UserDto, Follow } from "tweeter-shared";
import { Service } from "./Service";
import { FollowDaoI } from "../../data/interfaces/FollowDaoI";
import { DaoFactory } from "../../data/interfaces/DaoFactory";

export class FollowService implements Service {
  private followDao: FollowDaoI;

  constructor(factory: DaoFactory) {
    this.followDao = factory.getFollowDao();
  }

  public async loadMoreFollowees(
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<[UserDto[], boolean]> {
    const data = await this.followDao.loadMoreFollowees(
      userAlias,
      pageSize,
      lastItem,
    );
    return [data.values, data.hasMorePages];
  }

  public async loadMoreFollowers(
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<[UserDto[], boolean]> {
    const data = await this.followDao.loadMoreFollowers(
      userAlias,
      pageSize,
      lastItem,
    );
    return [data.values, data.hasMorePages];
  }

  public async getIsFollowerStatus(
    user: UserDto,
    selectedUser: UserDto,
  ): Promise<boolean> {
    return await this.followDao.getIsFollower(user.alias, selectedUser.alias);
  }

  public async getFolloweeCount(user: UserDto): Promise<number> {
    return await this.followDao.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(user: UserDto): Promise<number> {
    return await this.followDao.getFollowerCount(user.alias);
  }

  public async follow(
    user: UserDto,
    userToFollow: UserDto,
  ): Promise<[followerCount: number, followeeCount: number]> {
    if (user == null || userToFollow == null)
      throw Error("[bad-request]: Invalid user or follow target");
    await this.followDao.putFollow(
      new Follow(User.fromDto(user)!, User.fromDto(userToFollow)!),
    );
    const followerCount = await this.followDao.getFollowerCount(
      userToFollow.alias,
    );
    const followeeCount = await this.followDao.getFolloweeCount(
      userToFollow.alias,
    );
    return [followerCount, followeeCount];
  }

  public async unfollow(
    user: UserDto,
    userToUnfollow: UserDto,
  ): Promise<[followerCount: number, followeeCount: number]> {
    if (user == null || userToUnfollow == null)
      throw Error("[bad-request]: Invalid user or follow target");
    await this.followDao.deleteFollow(
      new Follow(User.fromDto(user)!, User.fromDto(userToUnfollow)!),
    );
    const followerCount = await this.followDao.getFollowerCount(
      userToUnfollow.alias,
    );
    const followeeCount = await this.followDao.getFolloweeCount(
      userToUnfollow.alias,
    );
    return [followerCount, followeeCount];
  }
}
