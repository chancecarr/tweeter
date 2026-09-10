"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const UserService_1 = require("../../model/service/UserService");
const DynamoDaoFactory_1 = require("../../data/implementations/DynamoDaoFactory");
const handleLambdaError_1 = require("../handleLambdaError");
const handler = async (request) => {
    try {
        const factory = new DynamoDaoFactory_1.DynamoDaoFactory();
        const userService = new UserService_1.UserService(factory);
        const [user, authToken] = await userService.login(request.alias, request.password);
        return {
            success: true,
            message: null,
            user: user,
            authToken: authToken,
        };
    }
    catch (error) {
        (0, handleLambdaError_1.handleLambdaError)(error);
    }
};
exports.handler = handler;
