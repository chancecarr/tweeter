"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
class AuthService {
    authDao;
    constructor(factory) {
        this.authDao = factory.getAuthDao();
    }
    async auth(token) {
        if (!(await this.authDao.authenticate(token))) {
            throw Error("[unauthorized]: Invalid session");
        }
    }
}
exports.AuthService = AuthService;
