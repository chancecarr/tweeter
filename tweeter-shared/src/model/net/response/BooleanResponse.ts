import { TweeterResponse } from "./TweeterResponse";

export interface BooleanResponse extends TweeterResponse {
  readonly booleanResult: boolean;
}
