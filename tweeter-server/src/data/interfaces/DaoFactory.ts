import { AuthDaoI } from "./AuthDaoI";
import { FeedDaoI } from "./FeedDaoI";
import { FollowDaoI } from "./FollowDaoI";
import { StatusDaoI } from "./StatusDaoI";
import { StoryDaoI } from "./StoryDaoI";
import { UserDaoI } from "./UserDaoI";

export interface DaoFactory {
  getFollowDao(): FollowDaoI;
  getStatusDao(): StatusDaoI;
  getUserDao(): UserDaoI;
  getAuthDao(): AuthDaoI;
  getStoryDao(): StoryDaoI;
  getFeedDao(): FeedDaoI;
}
