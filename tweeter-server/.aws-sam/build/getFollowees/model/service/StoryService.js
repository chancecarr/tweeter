"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryService = void 0;
class StoryService {
    storyDao;
    constructor(factory) {
        this.storyDao = factory.getStoryDao();
    }
    async postStatus(newStatus) {
        await this.storyDao.putStory(newStatus);
    }
    async loadMoreStoryItems(userAlias, pageSize, lastItem) {
        const data = await this.storyDao.loadMoreStoryItems(userAlias, pageSize, lastItem);
        return [data.values, data.hasMorePages];
    }
}
exports.StoryService = StoryService;
