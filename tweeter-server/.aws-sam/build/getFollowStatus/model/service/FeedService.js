"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
class FeedService {
    feedDao;
    constructor(factory) {
        this.feedDao = factory.getFeedDao();
    }
    async postToFeeds(newStatus, followerBatch) {
        await this.feedDao.batchUpdateFeeds(followerBatch, newStatus);
    }
    async loadMoreFeedItems(userAlias, pageSize, lastItem) {
        const data = await this.feedDao.loadMoreFeedItems(userAlias, pageSize, lastItem);
        return [data.values, data.hasMorePages];
    }
}
exports.FeedService = FeedService;
