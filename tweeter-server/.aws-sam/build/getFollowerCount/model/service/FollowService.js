"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowService = void 0;
const tweeter_shared_1 = require("tweeter-shared");
class FollowService {
    followDao;
    constructor(factory) {
        this.followDao = factory.getFollowDao();
    }
    async loadMoreFollowees(userAlias, pageSize, lastItem) {
        const data = await this.followDao.loadMoreFollowees(userAlias, pageSize, lastItem);
        return [data.values, data.hasMorePages];
    }
    async loadMoreFollowers(userAlias, pageSize, lastItem) {
        const data = await this.followDao.loadMoreFollowers(userAlias, pageSize, lastItem);
        return [data.values, data.hasMorePages];
    }
    async getIsFollowerStatus(user, selectedUser) {
        return await this.followDao.getIsFollower(user.alias, selectedUser.alias);
    }
    async getFolloweeCount(user) {
        return await this.followDao.getFolloweeCount(user.alias);
    }
    async getFollowerCount(user) {
        return await this.followDao.getFollowerCount(user.alias);
    }
    async follow(user, userToFollow) {
        if (user == null || userToFollow == null)
            throw Error("[bad-request]: Invalid user or follow target");
        await this.followDao.putFollow(new tweeter_shared_1.Follow(tweeter_shared_1.User.fromDto(user), tweeter_shared_1.User.fromDto(userToFollow)));
        const followerCount = await this.followDao.getFollowerCount(userToFollow.alias);
        const followeeCount = await this.followDao.getFolloweeCount(userToFollow.alias);
        return [followerCount, followeeCount];
    }
    async unfollow(user, userToUnfollow) {
        if (user == null || userToUnfollow == null)
            throw Error("[bad-request]: Invalid user or follow target");
        await this.followDao.deleteFollow(new tweeter_shared_1.Follow(tweeter_shared_1.User.fromDto(user), tweeter_shared_1.User.fromDto(userToUnfollow)));
        const followerCount = await this.followDao.getFollowerCount(userToUnfollow.alias);
        const followeeCount = await this.followDao.getFolloweeCount(userToUnfollow.alias);
        return [followerCount, followeeCount];
    }
}
exports.FollowService = FollowService;
