import { AuthDaoI } from "../interfaces/AuthDaoI";
import { DaoFactory } from "../interfaces/DaoFactory";
import { FeedDaoI } from "../interfaces/FeedDaoI";
import { FollowDaoI } from "../interfaces/FollowDaoI";
import { StatusDaoI } from "../interfaces/StatusDaoI";
import { StoryDaoI } from "../interfaces/StoryDaoI";
import { UserDaoI } from "../interfaces/UserDaoI";
import { AuthDao } from "./AuthDao";
import { FeedDao } from "./FeedDao";
import { FollowDao } from "./FollowDao";
import { StatusDao } from "./StatusDao";
import { StorageDao } from "./StorageDao";
import { StoryDao } from "./StoryDao";
import { UserDao } from "./UserDao";

export class DynamoDaoFactory implements DaoFactory {
  public getFollowDao(): FollowDaoI {
    return new FollowDao();
  }
  public getStatusDao(): StatusDaoI {
    return new StatusDao();
  }
  public getUserDao(): UserDaoI {
    return new UserDao(new AuthDao(), new StorageDao());
  }
  public getAuthDao(): AuthDaoI {
    return new AuthDao();
  }
  public getStoryDao(): StoryDaoI {
    return new StoryDao();
  }
  public getFeedDao(): FeedDaoI {
    return new FeedDao();
  }
}
