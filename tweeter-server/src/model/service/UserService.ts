import { Buffer } from "buffer";
import { AuthTokenDto, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { DaoFactory } from "../../data/interfaces/DaoFactory";
import { UserDaoI } from "../../data/interfaces/UserDaoI";

export class UserService implements Service {
  private userDao: UserDaoI;

  constructor(factory: DaoFactory) {
    this.userDao = factory.getUserDao();
  }

  public async getUser(alias: string): Promise<UserDto | null> {
    const maybeUser = await this.userDao.getUser(alias);
    return maybeUser ?? null;
  }

  public async login(
    alias: string,
    password: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    const data = await this.userDao.loginUser(alias, password);
    if (data != undefined) {
      return data;
    } else {
      throw Error("[bad-request]: user not found");
    }
  }

  public async logout(token: AuthTokenDto): Promise<void> {
    await this.userDao.logoutUser(token);
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    const data = await this.userDao.registerUser(
      firstName,
      lastName,
      alias,
      password,
      userImageBytes,
      imageFileExtension,
    );

    if (data != undefined) {
      return data;
    } else {
      throw Error("Login error after register");
    }
  }
}
