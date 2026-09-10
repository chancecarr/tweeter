"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDaoFactory = void 0;
const AuthDao_1 = require("./AuthDao");
const FeedDao_1 = require("./FeedDao");
const FollowDao_1 = require("./FollowDao");
const StatusDao_1 = require("./StatusDao");
const StorageDao_1 = require("./StorageDao");
const StoryDao_1 = require("./StoryDao");
const UserDao_1 = require("./UserDao");
class DynamoDaoFactory {
    getFollowDao() {
        return new FollowDao_1.FollowDao();
    }
    getStatusDao() {
        return new StatusDao_1.StatusDao();
    }
    getUserDao() {
        return new UserDao_1.UserDao(new AuthDao_1.AuthDao(), new StorageDao_1.StorageDao());
    }
    getAuthDao() {
        return new AuthDao_1.AuthDao();
    }
    getStoryDao() {
        return new StoryDao_1.StoryDao();
    }
    getFeedDao() {
        return new FeedDao_1.FeedDao();
    }
}
exports.DynamoDaoFactory = DynamoDaoFactory;
