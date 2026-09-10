import { UserDto } from "../../dto/UserDto";
import { AuthedRequest } from "./AuthedRequest";

export interface UserRequest extends AuthedRequest {
  readonly user: UserDto;
}
