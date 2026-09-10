import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthDaoI } from "../interfaces/AuthDaoI";
import { createHash } from "node:crypto";
import { AuthTokenDto } from "tweeter-shared";

export class AuthDao implements AuthDaoI {
  protected readonly client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-east-1" }),
  );

  private tableName = "sessions";

  async putToken(token: AuthTokenDto): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: this.generateTokenItem(token),
    };
    await this.client.send(new PutCommand(params));
  }

  async deleteToken(token: AuthTokenDto): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { tokenHash: this.generateTokenItem(token).tokenHash },
    };
    await this.client.send(new DeleteCommand(params));
  }

  async authenticate(token: AuthTokenDto): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: { tokenHash: this.generateTokenItem(token).tokenHash },
    };
    const command = new GetCommand(params);
    const response = await this.client.send(command);
    if (response.Item == undefined) {
      return false;
    } else {
      return Date.now() < response.Item.timestamp + 1800000;
    }
  }

  private generateTokenItem(token: AuthTokenDto) {
    const hash = createHash("sha256").update(token.token).digest("hex");
    return {
      tokenHash: hash,
      timestamp: token.timestamp,
    };
  }
}
