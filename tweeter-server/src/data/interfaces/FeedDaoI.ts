import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../model/data/DataPage";

export interface FeedDaoI {
  loadMoreFeedItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<DataPage<StatusDto>>;

  batchUpdateFeeds(aliases: string[], newFeedItem: StatusDto): Promise<void>;
}
