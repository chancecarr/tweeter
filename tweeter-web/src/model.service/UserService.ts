import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";
import { Buffer } from "buffer";

export class UserService implements Service {
  private serverFacade: ServerFacade;

  constructor() {
    this.serverFacade = ServerFacade.getInstance();
  }

  public async getUser(
    authToken: AuthToken,
    alias: string,
  ): Promise<User | null> {
    return await this.serverFacade.getUser({
      token: authToken.dto,
      alias: alias,
    });
  }

  public async login(
    alias: string,
    password: string,
  ): Promise<[User, AuthToken]> {
    return await this.serverFacade.login({ alias: alias, password: password });
  }

  public async logout(authToken: AuthToken): Promise<void> {
    await this.serverFacade.logout({ token: authToken.dto });
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string,
  ): Promise<[User, AuthToken]> {
    return await this.serverFacade.register({
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      password: password,
      userImageBytes: Buffer.from(userImageBytes).toString("base64"),
      imageFileExtension: imageFileExtension,
    });
  }
}
