"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedDao = void 0;
const StatusDao_1 = require("./StatusDao");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
class FeedDao extends StatusDao_1.StatusDao {
    client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }));
    tableName = "feeds";
    aliasAttr = "alias";
    timestampAttr = "timestamp";
    async loadMoreFeedItems(userAlias, pageSize, lastItem) {
        return await this.loadMoreStatusItems(userAlias, pageSize, lastItem, this.tableName);
    }
    async batchUpdateFeeds(aliases, newFeedItem) {
        if (!aliases || aliases.length === 0)
            return;
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
            await this.client.send(new lib_dynamodb_1.BatchWriteCommand(params));
        }
        catch (error) {
            console.error("Error writing batch to DynamoDB:", error);
            throw error;
        }
    }
}
exports.FeedDao = FeedDao;
