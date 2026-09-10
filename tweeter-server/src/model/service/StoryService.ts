import { StatusDto } from "tweeter-shared";
import { DaoFactory } from "../../data/interfaces/DaoFactory";
import { Service } from "./Service";
import { StoryDaoI } from "../../data/interfaces/StoryDaoI";

export class StoryService implements Service {
  private storyDao: StoryDaoI;

  constructor(factory: DaoFactory) {
    this.storyDao = factory.getStoryDao();
  }

  public async postStatus(newStatus: StatusDto): Promise<void> {
    await this.storyDao.putStory(newStatus);
  }

  public async loadMoreStoryItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    const data = await this.storyDao.loadMoreStoryItems(
      userAlias,
      pageSize,
      lastItem,
    );
    return [data.values, data.hasMorePages];
  }
}
