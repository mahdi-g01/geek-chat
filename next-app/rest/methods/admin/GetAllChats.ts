import { RestMethod } from "@/rest/RestMethod";
import { ResponseType } from "@/rest/RestMethod";
import { AxiosResponse } from "axios";
import { Chat } from "@/rest/types/Chat";
import { Paginated, PaginationMeta } from "@/rest/types/Pagination";

export type GetAllChatsInput = {
    page?: number;
    per_page?: number;
    search?: string;
} | null;

type OUTPUT = Paginated<Chat>;

type ServerResponse = {
    chats: Chat[];
    pagination: PaginationMeta;
};

export default class GetAllChats extends RestMethod<OUTPUT, GetAllChatsInput, ServerResponse> {

    prepareMethod(input?: GetAllChatsInput): Promise<AxiosResponse> {
        const params: { page?: number; per_page?: number; search?: string } = {};
        if (input?.page != null) params.page = input.page;
        if (input?.per_page != null) params.per_page = input.per_page;
        if (input?.search != null && input.search !== "") params.search = input.search;
        return this.axiosInstance!.get("admin/all-chats", { params });
    }

    protected rawDataTransformer(rawData: ServerResponse, _originalBody: ResponseType<OUTPUT>): OUTPUT {
        return {
            items: rawData.chats,
            pagination: rawData.pagination,
        };
    }
}
