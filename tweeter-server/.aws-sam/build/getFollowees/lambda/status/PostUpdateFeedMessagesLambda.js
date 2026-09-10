"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const DynamoDaoFactory_1 = require("../../data/implementations/DynamoDaoFactory");
const handleLambdaError_1 = require("../handleLambdaError");
const FollowService_1 = require("../../model/service/FollowService");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const factory = new DynamoDaoFactory_1.DynamoDaoFactory();
const followService = new FollowService_1.FollowService(factory);
const sqsClient = new client_sqs_1.SQSClient();
const update_feed_url = "https://sqs.us-east-1.amazonaws.com/588597505194/updateFeedQueue";
const self_url = "https://sqs.us-east-1.amazonaws.com/588597505194/postStatusQueue";
const handler = async (event) => {
    for (const record of event.Records) {
        const { newStatus, lastItem } = JSON.parse(record.body);
        await postMessageToFollowers(newStatus, lastItem);
    }
};
exports.handler = handler;
async function postMessageToFollowers(newStatus, lastItem) {
    try {
        const [batch, hasMore] = await followService.loadMoreFollowers(newStatus.user.alias, 25, lastItem);
        if (!batch || batch.length === 0) {
            console.log("No more followers found. Ending recursion.");
            return;
        }
        console.log(`Processing batch for ${newStatus.user.alias}. LastItem: ${lastItem?.alias || "START"}. HasMore: ${hasMore}`);
        if (batch.length > 0) {
            await sqsClient.send(new client_sqs_1.SendMessageCommand({
                QueueUrl: update_feed_url,
                MessageBody: JSON.stringify({
                    newStatus: newStatus,
                    followers: batch.map((f) => f.alias),
                }),
            }));
            if (hasMore) {
                const nextLastItem = batch[batch.length - 1];
                await sqsClient.send(new client_sqs_1.SendMessageCommand({
                    QueueUrl: self_url,
                    MessageBody: JSON.stringify({
                        newStatus: newStatus,
                        lastItem: nextLastItem,
                    }),
                }));
            }
        }
        return {
            success: true,
            message: null,
        };
    }
    catch (error) {
        (0, handleLambdaError_1.handleLambdaError)(error);
    }
}
