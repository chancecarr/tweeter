import { StatusDto } from "tweeter-shared";
import { FeedDaoI } from "../../data/interfaces/FeedDaoI";
import { Service } from "./Service";
import { DaoFactory } from "../../data/interfaces/DaoFactory";

export class FeedService implements Service {
  private feedDao: FeedDaoI;

  constructor(factory: DaoFactory) {
    this.feedDao = factory.getFeedDao();
  }

  public async postToFeeds(
    newStatus: StatusDto,
    followerBatch: string[],
  ): Promise<void> {
    await this.feedDao.batchUpdateFeeds(followerBatch, newStatus);
  }

  public async loadMoreFeedItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    const data = await this.feedDao.loadMoreFeedItems(
      userAlias,
      pageSize,
      lastItem,
    );
    return [data.values, data.hasMorePages];
  }
}
