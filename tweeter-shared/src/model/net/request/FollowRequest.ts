import { UserDto } from "../../dto/UserDto";
import { UserRequest } from "./UserRequest";

export interface FollowRequest extends UserRequest {
  followActionTarget: UserDto;
}
