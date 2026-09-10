"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const FeedService_1 = require("../../model/service/FeedService");
const DynamoDaoFactory_1 = require("../../data/implementations/DynamoDaoFactory");
const handleLambdaError_1 = require("../handleLambdaError");
const AuthService_1 = require("../../model/service/AuthService");
const handler = async (request) => {
    try {
        const factory = new DynamoDaoFactory_1.DynamoDaoFactory();
        const authService = new AuthService_1.AuthService(factory);
        authService.auth(request.token);
        const feedService = new FeedService_1.FeedService(factory);
        const [items, hasMore] = await feedService.loadMoreFeedItems(request.userAlias, request.pageSize, request.lastItem);
        return {
            success: true,
            message: null,
            items: items,
            hasMore: hasMore,
        };
    }
    catch (error) {
        (0, handleLambdaError_1.handleLambdaError)(error);
    }
};
exports.handler = handler;
