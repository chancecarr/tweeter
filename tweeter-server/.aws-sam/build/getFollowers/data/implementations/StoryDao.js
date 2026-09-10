"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryDao = void 0;
const StatusDao_1 = require("./StatusDao");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
class StoryDao extends StatusDao_1.StatusDao {
    tableName = "stories";
    async putStory(newStory) {
        const storyParams = {
            TableName: this.tableName,
            Item: {
                alias: newStory.user.alias,
                timestamp: newStory.timestamp,
                post: newStory.post,
                user: newStory.user,
            },
        };
        await this.client.send(new lib_dynamodb_1.PutCommand(storyParams));
    }
    async loadMoreStoryItems(userAlias, pageSize, lastItem) {
        return await this.loadMoreStatusItems(userAlias, pageSize, lastItem, this.tableName);
    }
}
exports.StoryDao = StoryDao;
