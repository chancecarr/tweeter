import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../model/data/DataPage";
import { StatusDaoI } from "../interfaces/StatusDaoI";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class StatusDao implements StatusDaoI {
  protected readonly client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-east-1" }),
  );

  async loadMoreStatusItems(
    alias: string,
    pageSize: number,
    lastItem: StatusDto | null,
    table: string,
  ): Promise<DataPage<StatusDto>> {
    const params = {
      TableName: table,
      KeyConditionExpression: "alias = :pk",
      ExpressionAttributeValues: {
        ":pk": alias,
      },
      Limit: pageSize,
      ScanIndexForward: false,
      ExclusiveStartKey: lastItem
        ? {
            alias: alias,
            timestamp: lastItem.timestamp,
          }
        : undefined,
    };

    const response = await this.client.send(new QueryCommand(params));
    const items: StatusDto[] = [];
    response.Items?.forEach((item) => {
      items.push({
        post: item.post,
        user: item.user,
        timestamp: item.timestamp,
      });
    });
    const hasMore = response.LastEvaluatedKey != undefined;
    return new DataPage<StatusDto>(items, hasMore);
  }
}
