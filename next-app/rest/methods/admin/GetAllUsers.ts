import { RestMethod } from "@/rest/RestMethod";
import { AxiosResponse } from "axios";
import { UserPrivate } from "@/rest/types/User";
import { Paginated, PaginationMeta } from "@/rest/types/Pagination";

export type GetAllUsersInput = {
    per_page?: number;
    page?: number;
    search?: string;
} | null;

type OUTPUT = Paginated<UserPrivate>;

type ServerResponse = {
    users: UserPrivate[];
    pagination: PaginationMeta;
};

export default class GetAllUsers extends RestMethod<OUTPUT, GetAllUsersInput, ServerResponse> {

    prepareMethod(input?: GetAllUsersInput): Promise<AxiosResponse> {
        const params: { per_page?: number;  page?: number; search?: string } = {};
        if (input?.per_page != null) params.per_page = input.per_page;
        if (input?.search != null && input.search !== "") params.search = input.search;
        if (input?.page != null) params.page = input.page;
        return this.axiosInstance!.get("admin/all-users", { params });
    }

    protected rawDataTransformer(rawData: ServerResponse): OUTPUT {
        return {
            items: rawData.users,
            pagination: rawData.pagination,
        };
    }
}
