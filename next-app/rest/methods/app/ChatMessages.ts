import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {Chat} from "@/rest/types/Chat";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";

type INPUT = {
    chat_id: string,
    load_from_ts?: string,
    load_until_ts?: string,
    limit: number | null
}

type OUTPUT = {
    messages: Chat["messages"]
};

type ServerResponse = OUTPUT;

export default class ChatMessages extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        return this.axiosInstance!.get("app/chat-messages", {
            headers: {
                "X-Device-Public-Key": publicKey
            },
            params: input
        });
    }

}
