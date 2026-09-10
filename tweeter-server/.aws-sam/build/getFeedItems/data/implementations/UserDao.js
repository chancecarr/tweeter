"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDao = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserDao {
    tableName = "users";
    authDao;
    storageDao;
    client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }));
    constructor(authDao, storageDao) {
        this.authDao = authDao;
        this.storageDao = storageDao;
    }
    async getUser(alias) {
        const params = {
            TableName: this.tableName,
            Key: { alias: alias },
        };
        const output = await this.client.send(new lib_dynamodb_1.GetCommand(params));
        return output.Item == undefined
            ? undefined
            : {
                firstName: output.Item["firstName"],
                lastName: output.Item["lastName"],
                alias: output.Item["alias"],
                imageUrl: output.Item["imageUrl"],
            };
    }
    async registerUser(firstName, lastName, alias, password, userImageString, imageFileExtension) {
        const fileName = `${alias}.${imageFileExtension}`;
        const imageUrl = await this.storageDao.putImage(fileName, userImageString, imageFileExtension);
        const hash = await bcryptjs_1.default.hash(password, 10);
        const transactionParams = {
            TransactItems: [
                {
                    Put: {
                        TableName: this.tableName,
                        Item: {
                            firstName: firstName,
                            lastName: lastName,
                            alias: alias,
                            imageUrl: imageUrl,
                        },
                        ConditionExpression: "attribute_not_exists(alias)",
                    },
                },
                {
                    Put: {
                        TableName: "logins",
                        Item: {
                            alias: alias,
                            hash: hash,
                        },
                        ConditionExpression: "attribute_not_exists(alias)",
                    },
                },
            ],
        };
        try {
            await this.client.send(new lib_dynamodb_1.TransactWriteCommand(transactionParams));
        }
        catch (error) {
            throw new Error("Registration failed due to a system or data conflict");
        }
        return await this.loginUser(alias, password);
    }
    async loginUser(alias, password) {
        if (await this.authenticateLogin(alias, password)) {
            const authToken = tweeter_shared_1.AuthToken.Generate();
            await this.authDao.putToken(authToken.dto);
            return [(await this.getUser(alias)), authToken.dto];
        }
        else {
            throw new Error("Invalid login");
        }
    }
    async logoutUser(token) {
        await this.authDao.deleteToken(token);
    }
    async authenticateLogin(alias, password) {
        const params = {
            TableName: "logins",
            Key: { alias: alias },
        };
        const output = await this.client.send(new lib_dynamodb_1.GetCommand(params));
        return output.Item == undefined
            ? false
            : await bcryptjs_1.default.compare(password, output.Item.hash);
    }
}
exports.UserDao = UserDao;
