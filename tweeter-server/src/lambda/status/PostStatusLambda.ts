import { AuthTokenDto, StatusDto, TweeterResponse } from "tweeter-shared";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";
import { AuthService } from "../../model/service/AuthService";
import { StoryService } from "../../model/service/StoryService";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const factory = new DynamoDaoFactory();
const authService = new AuthService(factory);
const storyService = new StoryService(factory);
let sqsClient = new SQSClient();
const sqs_url =
  "https://sqs.us-east-1.amazonaws.com/588597505194/postStatusQueue";

export const handler = async (request: {
  token: AuthTokenDto;
  newStatus: StatusDto;
}): Promise<TweeterResponse> => {
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

    await sqsClient.send(new SendMessageCommand(params));

    return {
      success: true,
      message: null,
    };
  } catch (error) {
    handleLambdaError(error);
  }
};
