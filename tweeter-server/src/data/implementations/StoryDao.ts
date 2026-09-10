import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../model/data/DataPage";
import { StoryDaoI } from "../interfaces/StoryDaoI";
import { StatusDao } from "./StatusDao";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export class StoryDao extends StatusDao implements StoryDaoI {
  private tableName = "stories";

  async putStory(newStory: StatusDto): Promise<void> {
    const storyParams = {
      TableName: this.tableName,
      Item: {
        alias: newStory.user.alias,
        timestamp: newStory.timestamp,
        post: newStory.post,
        user: newStory.user,
      },
    };

    await this.client.send(new PutCommand(storyParams));
  }

  async loadMoreStoryItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<DataPage<StatusDto>> {
    return await this.loadMoreStatusItems(
      userAlias,
      pageSize,
      lastItem,
      this.tableName,
    );
  }
}
