import { AuthTokenDto } from "tweeter-shared";
import { AuthDaoI } from "../../data/interfaces/AuthDaoI";
import { DaoFactory } from "../../data/interfaces/DaoFactory";
import { Service } from "./Service";

export class AuthService implements Service {
  private authDao: AuthDaoI;

  constructor(factory: DaoFactory) {
    this.authDao = factory.getAuthDao();
  }

  public async auth(token: AuthTokenDto): Promise<void> {
    if (!(await this.authDao.authenticate(token))) {
      throw Error("[unauthorized]: Invalid session");
    }
  }
}
