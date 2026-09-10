import { AuthToken, AuthTokenDto, UserDto } from "tweeter-shared";
import { UserDaoI } from "../interfaces/UserDaoI";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthDaoI } from "../interfaces/AuthDaoI";
import { StorageDaoI } from "../interfaces/StorageDaoI";
import bcrypt from "bcryptjs";

export class UserDao implements UserDaoI {
  readonly tableName = "users";
  private authDao: AuthDaoI;
  private storageDao: StorageDaoI;

  private readonly client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-east-1" }),
  );

  constructor(authDao: AuthDaoI, storageDao: StorageDaoI) {
    this.authDao = authDao;
    this.storageDao = storageDao;
  }

  async getUser(alias: string): Promise<UserDto | undefined> {
    const params = {
      TableName: this.tableName,
      Key: { alias: alias },
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item == undefined
      ? undefined
      : {
          firstName: output.Item["firstName"],
          lastName: output.Item["lastName"],
          alias: output.Item["alias"],
          imageUrl: output.Item["imageUrl"],
        };
  }

  async registerUser(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageString: string,
    imageFileExtension: string,
  ): Promise<[UserDto, AuthTokenDto] | undefined> {
    const fileName = `${alias}.${imageFileExtension}`;
    const imageUrl = await this.storageDao.putImage(
      fileName,
      userImageString,
      imageFileExtension,
    );
    const hash = await bcrypt.hash(password, 10);
    const transactionParams = {
      TransactItems: [
        {
          Put: {
            TableName: this.tableName,
            Item: {
              firstName: firstName,
              lastName: lastName,
              alias: alias,
              imageUrl: imageUrl,
            },
            ConditionExpression: "attribute_not_exists(alias)",
          },
        },
        {
          Put: {
            TableName: "logins",
            Item: {
              alias: alias,
              hash: hash,
            },
            ConditionExpression: "attribute_not_exists(alias)",
          },
        },
      ],
    };

    try {
      await this.client.send(new TransactWriteCommand(transactionParams));
    } catch (error: any) {
      throw new Error("Registration failed due to a system or data conflict");
    }

    return await this.loginUser(alias, password);
  }

  async loginUser(
    alias: string,
    password: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    if (await this.authenticateLogin(alias, password)) {
      const authToken = AuthToken.Generate();
      await this.authDao.putToken(authToken.dto);
      return [(await this.getUser(alias))!, authToken.dto];
    } else {
      throw new Error("Invalid login");
    }
  }

  async logoutUser(token: AuthTokenDto): Promise<void> {
    await this.authDao.deleteToken(token);
  }

  async authenticateLogin(alias: string, password: string): Promise<boolean> {
    const params = {
      TableName: "logins",
      Key: { alias: alias },
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item == undefined
      ? false
      : await bcrypt.compare(password, output.Item.hash);
  }
}
