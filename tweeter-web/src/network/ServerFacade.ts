import {
  BooleanResponse,
  PagedItemRequest,
  PagedItemResponse,
  NumberResponse,
  User,
  UserDto,
  UserRequest,
  FollowResponse,
  StatusDto,
  Status,
  TweeterResponse,
  LoginResponse,
  LoginRequest,
  RegisterRequest,
  AuthToken,
  FollowRequest,
  AuthTokenDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private static instance: ServerFacade;
  private SERVER_URL =
    "https://yx53qdxe3j.execute-api.us-east-1.amazonaws.com/prod/";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  private constructor() {}

  public static getInstance(): ServerFacade {
    if (!ServerFacade.instance) ServerFacade.instance = new ServerFacade();
    return ServerFacade.instance;
  }

  private async getMore<DTO, T>(
    request: PagedItemRequest<DTO>,
    endpoint: string,
    message: string,
    fromDto: (dto: DTO) => T | null,
  ): Promise<[T[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedItemRequest<DTO>,
      PagedItemResponse<DTO>
    >(request, endpoint);

    // Handle errors
    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }

    if (!response.items) {
      throw new Error(`No ${message} found`);
    }

    // Convert the Dto array returned by ClientCommunicator to a T array.
    // Shenanigans with generics mean I need to filter out possible null values.
    const items = response.items
      .map(fromDto)
      .filter((item): item is T => item !== null);

    // DEBUG LOG
    if (items.length > 0 && items[0] instanceof Status) {
      console.log("User getter check:", (items[0] as any).user.firstName);
      console.log("Is User instance?", (items[0] as any).user instanceof User);
    }

    return [items, response.hasMore];
  }

  public async getMoreFollowees(request: PagedItemRequest<UserDto>) {
    return this.getMore<UserDto, User>(
      request,
      "follow/followee/list",
      "followees",
      User.fromDto,
    );
  }

  public async getMoreFollowers(request: PagedItemRequest<UserDto>) {
    return this.getMore<UserDto, User>(
      request,
      "follow/follower/list",
      "followers",
      User.fromDto,
    );
  }

  public async getFollowStatus(
    request: UserRequest & { selectedUser: UserDto },
  ): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      UserRequest & { selectedUser: UserDto },
      BooleanResponse
    >(request, "follow/follower/status");

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } else {
      return response.booleanResult;
    }
  }

  private async getCount(request: UserRequest, type: string): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      UserRequest,
      NumberResponse
    >(request, `follow/${type}/count`);

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } else {
      return response.numberResult;
    }
  }

  public async getFolloweeCount(request: UserRequest) {
    return this.getCount(request, "followee");
  }

  public async getFollowerCount(request: UserRequest): Promise<number> {
    return this.getCount(request, "follower");
  }

  private async followAction(
    request: FollowRequest,
    type: string,
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.clientCommunicator.doPost<
      FollowRequest,
      FollowResponse
    >(request, `${type}`);

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } else {
      return [response.followerCount, response.followeeCount];
    }
  }

  public async follow(request: FollowRequest) {
    return this.followAction(request, "follow");
  }

  public async unfollow(request: FollowRequest) {
    return this.followAction(request, "unfollow");
  }

  public async getMoreFeedItems(request: PagedItemRequest<StatusDto>) {
    return this.getMore<StatusDto, Status>(
      request,
      "status/feed/list",
      "feed items",
      Status.fromDto,
    );
  }

  public async getMoreStoryItems(request: PagedItemRequest<StatusDto>) {
    return this.getMore<StatusDto, Status>(
      request,
      "status/story/list",
      "story items",
      Status.fromDto,
    );
  }

  public async postStatus(request: {
    token: AuthTokenDto;
    newStatus: StatusDto;
  }): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      { token: AuthTokenDto; newStatus: StatusDto },
      TweeterResponse
    >(request, `status/create`);

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getUser(request: {
    token: AuthTokenDto;
    alias: string;
  }): Promise<User | null> {
    const response = await this.clientCommunicator.doPost<
      { token: AuthTokenDto; alias: string },
      TweeterResponse & { user: UserDto | null }
    >(request, `user/get`);

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } else {
      return User.fromDto(response.user);
    }
  }

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      LoginRequest,
      LoginResponse
    >(request, `user/login`);

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } else if (response.user == null || response.authToken == null) {
      throw new Error("Login unsuccessful.");
    } else {
      return [
        User.fromDto(response.user)!,
        AuthToken.fromDto(response.authToken)!,
      ];
    }
  }

  public async register(request: RegisterRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      RegisterRequest,
      LoginResponse
    >(request, `user/register`);

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } else if (response.user == null || response.authToken == null) {
      throw new Error("Login unsuccessful.");
    } else {
      return [
        User.fromDto(response.user)!,
        AuthToken.fromDto(response.authToken)!,
      ];
    }
  }

  public async logout(request: { token: AuthTokenDto }) {
    const response = await this.clientCommunicator.doPost<
      { token: AuthTokenDto },
      TweeterResponse
    >(request, `user/logout`);

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }
}
