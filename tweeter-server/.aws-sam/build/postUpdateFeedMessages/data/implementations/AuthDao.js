"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthDao = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const node_crypto_1 = require("node:crypto");
class AuthDao {
    client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }));
    tableName = "sessions";
    async putToken(token) {
        const params = {
            TableName: this.tableName,
            Item: this.generateTokenItem(token),
        };
        await this.client.send(new lib_dynamodb_1.PutCommand(params));
    }
    async deleteToken(token) {
        const params = {
            TableName: this.tableName,
            Key: { tokenHash: this.generateTokenItem(token).tokenHash },
        };
        await this.client.send(new lib_dynamodb_1.DeleteCommand(params));
    }
    async authenticate(token) {
        const params = {
            TableName: this.tableName,
            Key: { tokenHash: this.generateTokenItem(token).tokenHash },
        };
        const command = new lib_dynamodb_1.GetCommand(params);
        const response = await this.client.send(command);
        if (response.Item == undefined) {
            return false;
        }
        else {
            return Date.now() < response.Item.timestamp + 1800000;
        }
    }
    generateTokenItem(token) {
        const hash = (0, node_crypto_1.createHash)("sha256").update(token.token).digest("hex");
        return {
            tokenHash: hash,
            timestamp: token.timestamp,
        };
    }
}
exports.AuthDao = AuthDao;
