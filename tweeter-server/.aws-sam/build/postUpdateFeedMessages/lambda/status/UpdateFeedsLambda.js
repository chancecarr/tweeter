"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const DynamoDaoFactory_1 = require("../../data/implementations/DynamoDaoFactory");
const handleLambdaError_1 = require("../handleLambdaError");
const FeedService_1 = require("../../model/service/FeedService");
const factory = new DynamoDaoFactory_1.DynamoDaoFactory();
const feedService = new FeedService_1.FeedService(factory);
const handler = async (event) => {
    for (const record of event.Records) {
        const { newStatus, followers } = JSON.parse(record.body);
        await updateFeeds(newStatus, followers);
    }
};
exports.handler = handler;
async function updateFeeds(newStatus, followers) {
    try {
        await feedService.postToFeeds(newStatus, followers);
        return {
            success: true,
            message: null,
        };
    }
    catch (error) {
        (0, handleLambdaError_1.handleLambdaError)(error);
    }
}
