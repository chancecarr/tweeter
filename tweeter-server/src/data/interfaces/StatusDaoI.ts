import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../model/data/DataPage";

export interface StatusDaoI {
  loadMoreStatusItems(
    alias: string,
    pageSize: number,
    lastItem: StatusDto | null,
    table: string,
  ): Promise<DataPage<StatusDto>>;
}
