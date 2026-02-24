import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {Chat} from "@/rest/types/Chat";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";

type INPUT = null

type OUTPUT = {
    chats: Chat[]
};

type ServerResponse = OUTPUT;

export default class UserChats extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        return this.axiosInstance!.get("app/user-chats", {
            headers: {
                "X-Device-Public-Key": publicKey
            },
            timeout: 4000
        });
    }

}
