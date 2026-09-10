import { PagedItemRequest, PagedItemResponse, StatusDto } from "tweeter-shared";
import { FeedService } from "../../model/service/FeedService";
import { DynamoDaoFactory } from "../../data/implementations/DynamoDaoFactory";
import { handleLambdaError } from "../handleLambdaError";
import { AuthService } from "../../model/service/AuthService";

export const handler = async (
  request: PagedItemRequest<StatusDto>,
): Promise<PagedItemResponse<StatusDto>> => {
  try {
    const factory = new DynamoDaoFactory();
    const authService = new AuthService(factory);
    authService.auth(request.token);

    const feedService = new FeedService(factory);
    const [items, hasMore] = await feedService.loadMoreFeedItems(
      request.userAlias,
      request.pageSize,
      request.lastItem,
    );

    return {
      success: true,
      message: null,
      items: items,
      hasMore: hasMore,
    };
  } catch (error) {
    handleLambdaError(error);
  }
};
