import { Follow, UserDto } from "tweeter-shared";
import { DataPage } from "../../model/data/DataPage";

export interface FollowDaoI {
  putFollow(follow: Follow): Promise<void>;

  deleteFollow(follow: Follow): Promise<void>;

  getIsFollower(alias: string, maybeFollowerAlias: string): Promise<boolean>;

  getFollowerCount(alias: string): Promise<number>;

  getFolloweeCount(alias: string): Promise<number>;

  loadMoreFollowers(
    alias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<DataPage<UserDto>>;

  loadMoreFollowees(
    alias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<DataPage<UserDto>>;
}
