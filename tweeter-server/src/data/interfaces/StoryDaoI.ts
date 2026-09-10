import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../model/data/DataPage";

export interface StoryDaoI {
  loadMoreStoryItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<DataPage<StatusDto>>;

  putStory(newStory: StatusDto): Promise<void>;
}
