import { StatusDto, TweeterResponse } from "tweeter-shared";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";
import { FeedService } from "../../model/service/FeedService";

const factory = new DynamoDaoFactory();
const feedService = new FeedService(factory);

export const handler = async (event: any) => {
  for (const record of event.Records) {
    const { newStatus, followers } = JSON.parse(record.body);
    await updateFeeds(newStatus, followers);
  }
};

async function updateFeeds(
  newStatus: StatusDto,
  followers: string[],
): Promise<TweeterResponse> {
  try {
    await feedService.postToFeeds(newStatus, followers);

    return {
      success: true,
      message: null,
    };
  } catch (error) {
    handleLambdaError(error);
  }
}
