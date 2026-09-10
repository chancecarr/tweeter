import { AuthTokenDto } from "../../dto/AuthTokenDto";
import { TweeterRequest } from "./TweeterRequest";

export interface AuthedRequest extends TweeterRequest {
  readonly token: AuthTokenDto;
}
