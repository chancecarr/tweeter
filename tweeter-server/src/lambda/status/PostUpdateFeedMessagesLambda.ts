import { StatusDto, UserDto } from "tweeter-shared";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";
import { FollowService } from "../../model/service/FollowService";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const factory = new DynamoDaoFactory();
const followService = new FollowService(factory);
const sqsClient = new SQSClient();
const update_feed_url =
  "https://sqs.us-east-1.amazonaws.com/588597505194/updateFeedQueue";
const self_url =
  "https://sqs.us-east-1.amazonaws.com/588597505194/postStatusQueue";

export const handler = async (event: any) => {
  for (const record of event.Records) {
    const { newStatus, lastItem } = JSON.parse(record.body);
    await postMessageToFollowers(newStatus, lastItem);
  }
};

async function postMessageToFollowers(
  newStatus: StatusDto,
  lastItem: UserDto | null,
) {
  try {
    const [batch, hasMore] = await followService.loadMoreFollowers(
      newStatus.user.alias,
      25,
      lastItem,
    );

    if (!batch || batch.length === 0) {
      console.log("No more followers found. Ending recursion.");
      return;
    }

    console.log(
      `Processing batch for ${newStatus.user.alias}. LastItem: ${lastItem?.alias || "START"}. HasMore: ${hasMore}`,
    );

    if (batch.length > 0) {
      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: update_feed_url,
          MessageBody: JSON.stringify({
            newStatus: newStatus,
            followers: batch.map((f) => f.alias),
          }),
        }),
      );

      if (hasMore) {
        const nextLastItem = batch[batch.length - 1];

        await sqsClient.send(
          new SendMessageCommand({
            QueueUrl: self_url,
            MessageBody: JSON.stringify({
              newStatus: newStatus,
              lastItem: nextLastItem,
            }),
          }),
        );
      }
    }

    return {
      success: true,
      message: null,
    };
  } catch (error) {
    handleLambdaError(error);
  }
}
