import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = {
    chat_id: string | number;
};

type OUTPUT = object;

type ServerResponse = OUTPUT;

export default class DeleteChat extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        return this.axiosInstance!.delete("admin/delete-chat", {
            data: { chat_id: input.chat_id },
        });
    }

}
