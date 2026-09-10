import { TweeterResponse } from "./TweeterResponse";

export interface NumberResponse extends TweeterResponse {
  readonly numberResult: number;
}
