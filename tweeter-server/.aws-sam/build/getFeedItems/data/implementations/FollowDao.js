"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowDao = void 0;
const DataPage_1 = require("../../model/data/DataPage");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
class FollowDao {
    client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }));
    tableName = "follows";
    async putFollow(follow) {
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
                        UpdateExpression: "SET followerCount = if_not_exists(followerCount, :zero) + :inc",
                        ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
                    },
                },
                {
                    Update: {
                        TableName: "users",
                        Key: { alias: follow.follower.alias },
                        UpdateExpression: "SET followeeCount = if_not_exists(followeeCount, :zero) + :inc",
                        ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
                    },
                },
            ],
        };
        await this.client.send(new lib_dynamodb_1.TransactWriteCommand(params));
    }
    async deleteFollow(follow) {
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
        await this.client.send(new lib_dynamodb_1.TransactWriteCommand(params));
    }
    async getIsFollower(alias, maybeFollowerAlias) {
        const params = {
            TableName: this.tableName,
            Key: { follower_handle: maybeFollowerAlias, followee_handle: alias },
        };
        const output = await this.client.send(new lib_dynamodb_1.GetCommand(params));
        return output.Item !== undefined;
    }
    async getFollowerCount(alias) {
        const params = {
            TableName: "users",
            Key: {
                alias: alias,
            },
            ProjectionExpression: "followerCount",
        };
        const output = await this.client.send(new lib_dynamodb_1.GetCommand(params));
        return output.Item?.followerCount ?? 0;
    }
    async getFolloweeCount(alias) {
        const params = {
            TableName: "users",
            Key: {
                alias: alias,
            },
            ProjectionExpression: "followeeCount",
        };
        const output = await this.client.send(new lib_dynamodb_1.GetCommand(params));
        return output.Item?.followeeCount ?? 0;
    }
    async loadMoreFollowItems(alias, pageSize, lastItem, type) {
        const pkName = type == "get_followers" ? "followee_handle" : "follower_handle";
        const skName = type == "get_followers" ? "follower_handle" : "followee_handle";
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
        const aliases = [];
        const data = await this.client.send(new lib_dynamodb_1.QueryCommand(params));
        const hasMorePages = data.LastEvaluatedKey !== undefined;
        data.Items?.forEach((follow) => {
            if (type == "get_followers") {
                aliases.push(follow.follower_handle);
            }
            else {
                aliases.push(follow.followee_handle);
            }
        });
        if (aliases.length == 0) {
            return new DataPage_1.DataPage([], hasMorePages);
        }
        const user_params = {
            RequestItems: {
                users: {
                    Keys: aliases.map((alias) => ({ alias })),
                },
            },
        };
        const output = await this.client.send(new lib_dynamodb_1.BatchGetCommand(user_params));
        const items = output.Responses?.users || [];
        const users_array = items.map((item) => ({
            firstName: item.firstName,
            lastName: item.lastName,
            alias: item.alias,
            imageUrl: item.imageUrl,
        }));
        return new DataPage_1.DataPage(users_array, hasMorePages);
    }
    async loadMoreFollowers(alias, pageSize, lastItem) {
        return await this.loadMoreFollowItems(alias, pageSize, lastItem, "get_followers");
    }
    async loadMoreFollowees(alias, pageSize, lastItem) {
        return await this.loadMoreFollowItems(alias, pageSize, lastItem, "get_followees");
    }
    generateFollowItem(follow) {
        return {
            follower_handle: follow.follower.alias,
            followee_handle: follow.followee.alias,
        };
    }
}
exports.FollowDao = FollowDao;
