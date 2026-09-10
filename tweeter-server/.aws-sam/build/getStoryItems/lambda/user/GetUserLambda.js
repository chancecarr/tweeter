"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const UserService_1 = require("../../model/service/UserService");
const DynamoDaoFactory_1 = require("../../data/implementations/DynamoDaoFactory");
const AuthService_1 = require("../../model/service/AuthService");
const handleLambdaError_1 = require("../handleLambdaError");
const handler = async (request) => {
    try {
        const factory = new DynamoDaoFactory_1.DynamoDaoFactory();
        const authService = new AuthService_1.AuthService(factory);
        await authService.auth(request.token);
        const userService = new UserService_1.UserService(factory);
        const user = await userService.getUser(request.alias);
        return {
            success: true,
            message: null,
            user: user,
        };
    }
    catch (error) {
        (0, handleLambdaError_1.handleLambdaError)(error);
    }
};
exports.handler = handler;
