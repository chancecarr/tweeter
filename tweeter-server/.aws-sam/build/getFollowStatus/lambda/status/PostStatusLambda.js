"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const DynamoDaoFactory_1 = require("../../data/implementations/DynamoDaoFactory");
const handleLambdaError_1 = require("../handleLambdaError");
const AuthService_1 = require("../../model/service/AuthService");
const StoryService_1 = require("../../model/service/StoryService");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const factory = new DynamoDaoFactory_1.DynamoDaoFactory();
const authService = new AuthService_1.AuthService(factory);
const storyService = new StoryService_1.StoryService(factory);
let sqsClient = new client_sqs_1.SQSClient();
const sqs_url = "https://sqs.us-east-1.amazonaws.com/588597505194/postStatusQueue";
const handler = async (request) => {
    try {
        authService.auth(request.token);
        await storyService.postStatus(request.newStatus);
        const messageBody = JSON.stringify({
            newStatus: request.newStatus,
            lastItem: null,
        });
        const params = {
            MessageBody: messageBody,
            QueueUrl: sqs_url,
        };
        await sqsClient.send(new client_sqs_1.SendMessageCommand(params));
        return {
            success: true,
            message: null,
        };
    }
    catch (error) {
        (0, handleLambdaError_1.handleLambdaError)(error);
    }
};
exports.handler = handler;
