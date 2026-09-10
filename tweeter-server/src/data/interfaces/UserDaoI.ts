import { AuthTokenDto, UserDto } from "tweeter-shared";

export interface UserDaoI {
  getUser(alias: string): Promise<UserDto | undefined>;

  registerUser(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageString: string,
    imageFileExtension: string,
  ): Promise<[UserDto, AuthTokenDto] | undefined>;

  loginUser(
    alias: string,
    password: string,
  ): Promise<[UserDto, AuthTokenDto] | undefined>;

  logoutUser(token: AuthTokenDto): Promise<void>;
}
