import { AuthedRequest } from "./AuthedRequest";

export interface PagedItemRequest<T> extends AuthedRequest {
  readonly userAlias: string;
  readonly pageSize: number;
  readonly lastItem: T | null;
}
