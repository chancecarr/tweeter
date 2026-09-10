import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../model/data/DataPage";
import { FeedDaoI } from "../interfaces/FeedDaoI";
import { StatusDao } from "./StatusDao";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

export class FeedDao extends StatusDao implements FeedDaoI {
  protected readonly client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-east-1" }),
  );

  private tableName = "feeds";
  private aliasAttr = "alias";
  private timestampAttr = "timestamp";

  async loadMoreFeedItems(
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

  async batchUpdateFeeds(
    aliases: string[],
    newFeedItem: StatusDto,
  ): Promise<void> {
    if (!aliases || aliases.length === 0) return;

    const putRequests = aliases.map((alias) => ({
      PutRequest: {
        Item: {
          [this.aliasAttr]: alias,
          [this.timestampAttr]: newFeedItem.timestamp,
          user: newFeedItem.user,
          post: newFeedItem.post,
        },
      },
    }));

    const params = {
      RequestItems: {
        [this.tableName]: putRequests,
      },
    };

    try {
      await this.client.send(new BatchWriteCommand(params));
    } catch (error) {
      console.error("Error writing batch to DynamoDB:", error);
      throw error;
    }
  }
}
