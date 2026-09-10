"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const FollowService_1 = require("../../model/service/FollowService");
const DynamoDaoFactory_1 = require("../../data/implementations/DynamoDaoFactory");
const handleLambdaError_1 = require("../handleLambdaError");
const AuthService_1 = require("../../model/service/AuthService");
const handler = async (request) => {
    try {
        const factory = new DynamoDaoFactory_1.DynamoDaoFactory();
        const authService = new AuthService_1.AuthService(factory);
        authService.auth(request.token);
        const followService = new FollowService_1.FollowService(factory);
        const [followerCount, followeeCount] = await followService.unfollow(request.user, request.followActionTarget);
        return {
            success: true,
            message: null,
            followerCount: followerCount,
            followeeCount: followeeCount,
        };
    }
    catch (error) {
        (0, handleLambdaError_1.handleLambdaError)(error);
    }
};
exports.handler = handler;
