import { AuthTokenDto } from "tweeter-shared";

export interface AuthDaoI {
  putToken(token: AuthTokenDto): Promise<void>;

  deleteToken(token: AuthTokenDto): Promise<void>;

  authenticate(token: AuthTokenDto): Promise<boolean>;
}
