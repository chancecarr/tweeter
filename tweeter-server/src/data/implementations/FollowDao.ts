import { Follow, UserDto } from "tweeter-shared";
import { DataPage } from "../../model/data/DataPage";
import { FollowDaoI } from "../interfaces/FollowDaoI";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class FollowDao implements FollowDaoI {
  protected readonly client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-east-1" }),
  );

  readonly tableName = "follows";

  async putFollow(follow: Follow): Promise<void> {
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: this.tableName,
            Item: this.generateFollowItem(follow),
            ConditionExpression: "attribute_not_exists(follower_handle)",
          },
        },
        {
          Update: {
            TableName: "users",
            Key: { alias: follow.followee.alias },
            UpdateExpression:
              "SET followerCount = if_not_exists(followerCount, :zero) + :inc",
            ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
          },
        },
        {
          Update: {
            TableName: "users",
            Key: { alias: follow.follower.alias },
            UpdateExpression:
              "SET followeeCount = if_not_exists(followeeCount, :zero) + :inc",
            ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
          },
        },
      ],
    };
    await this.client.send(new TransactWriteCommand(params));
  }

  async deleteFollow(follow: Follow): Promise<void> {
    const params = {
      TransactItems: [
        {
          Delete: {
            TableName: this.tableName,
            Key: this.generateFollowItem(follow),
            ConditionExpression: "attribute_exists(follower_handle)",
          },
        },
        {
          Update: {
            TableName: "users",
            Key: { alias: follow.followee.alias },
            UpdateExpression: "SET followerCount = followerCount - :dec",
            ExpressionAttributeValues: { ":dec": 1 },
          },
        },
        {
          Update: {
            TableName: "users",
            Key: { alias: follow.follower.alias },
            UpdateExpression: "SET followeeCount = followeeCount - :dec",
            ExpressionAttributeValues: { ":dec": 1 },
          },
        },
      ],
    };
    await this.client.send(new TransactWriteCommand(params));
  }

  async getIsFollower(
    alias: string,
    maybeFollowerAlias: string,
  ): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: { follower_handle: maybeFollowerAlias, followee_handle: alias },
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item !== undefined;
  }

  async getFollowerCount(alias: string): Promise<number> {
    const params = {
      TableName: "users",
      Key: {
        alias: alias,
      },
      ProjectionExpression: "followerCount",
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item?.followerCount ?? 0;
  }

  async getFolloweeCount(alias: string): Promise<number> {
    const params = {
      TableName: "users",
      Key: {
        alias: alias,
      },
      ProjectionExpression: "followeeCount",
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item?.followeeCount ?? 0;
  }

  async loadMoreFollowItems(
    alias: string,
    pageSize: number,
    lastItem: UserDto | null,
    type: string,
  ): Promise<DataPage<UserDto>> {
    const pkName =
      type == "get_followers" ? "followee_handle" : "follower_handle";
    const skName =
      type == "get_followers" ? "follower_handle" : "followee_handle";
    const indexName = type == "get_followers" ? "follows_index" : undefined;

    const params = {
      TableName: this.tableName,
      IndexName: indexName,
      KeyConditionExpression: `${pkName} = :a`,
      ExpressionAttributeValues: {
        ":a": alias,
      },
      Limit: pageSize,
      ExclusiveStartKey: lastItem
        ? {
            [pkName]: alias,
            [skName]: lastItem.alias,
          }
        : undefined,
    };

    const aliases: string[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((follow) => {
      if (type == "get_followers") {
        aliases.push(follow.follower_handle);
      } else {
        aliases.push(follow.followee_handle);
      }
    });

    if (aliases.length == 0) {
      return new DataPage<UserDto>([], hasMorePages);
    }

    const user_params = {
      RequestItems: {
        users: {
          Keys: aliases.map((alias) => ({ alias })),
        },
      },
    };
    const output = await this.client.send(new BatchGetCommand(user_params));
    const items = output.Responses?.users || [];

    const users_array = items.map((item) => ({
      firstName: item.firstName,
      lastName: item.lastName,
      alias: item.alias,
      imageUrl: item.imageUrl,
    }));
    return new DataPage<UserDto>(users_array, hasMorePages);
  }

  async loadMoreFollowers(
    alias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<DataPage<UserDto>> {
    return await this.loadMoreFollowItems(
      alias,
      pageSize,
      lastItem,
      "get_followers",
    );
  }

  async loadMoreFollowees(
    alias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<DataPage<UserDto>> {
    return await this.loadMoreFollowItems(
      alias,
      pageSize,
      lastItem,
      "get_followees",
    );
  }

  private generateFollowItem(follow: Follow) {
    return {
      follower_handle: follow.follower.alias,
      followee_handle: follow.followee.alias,
    };
  }
}
