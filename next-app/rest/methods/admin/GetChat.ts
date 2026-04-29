import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {Chat} from "@/rest/types/Chat";
import {UserPublic} from "@/rest/types/User";

type INPUT = {
    chat_id: string | number;
};

type OUTPUT = {
    chat_model: Chat,
    users: UserPublic[],
    files_count: number,
    messages_count: number,
    files_size: number
};

type ServerResponse = OUTPUT;

export default class GetChat extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        return this.axiosInstance!.get("admin/get-chat", {
            params: { chat_id: input.chat_id },
        });
    }

}
