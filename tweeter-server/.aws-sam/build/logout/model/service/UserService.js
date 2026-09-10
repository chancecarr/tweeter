"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    userDao;
    constructor(factory) {
        this.userDao = factory.getUserDao();
    }
    async getUser(alias) {
        const maybeUser = await this.userDao.getUser(alias);
        return maybeUser ?? null;
    }
    async login(alias, password) {
        const data = await this.userDao.loginUser(alias, password);
        if (data != undefined) {
            return data;
        }
        else {
            throw Error("[bad-request]: user not found");
        }
    }
    async logout(token) {
        await this.userDao.logoutUser(token);
    }
    async register(firstName, lastName, alias, password, userImageBytes, imageFileExtension) {
        const data = await this.userDao.registerUser(firstName, lastName, alias, password, userImageBytes, imageFileExtension);
        if (data != undefined) {
            return data;
        }
        else {
            throw Error("Login error after register");
        }
    }
}
exports.UserService = UserService;
