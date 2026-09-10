"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusDao = void 0;
const DataPage_1 = require("../../model/data/DataPage");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
class StatusDao {
    client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }));
    async loadMoreStatusItems(alias, pageSize, lastItem, table) {
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
        const response = await this.client.send(new lib_dynamodb_1.QueryCommand(params));
        const items = [];
        response.Items?.forEach((item) => {
            items.push({
                post: item.post,
                user: item.user,
                timestamp: item.timestamp,
            });
        });
        const hasMore = response.LastEvaluatedKey != undefined;
        return new DataPage_1.DataPage(items, hasMore);
    }
}
exports.StatusDao = StatusDao;
