import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {Chat as ChatType, ChatMessages} from "@/rest/types/Chat";
import {UserPublic} from "@/rest/types/User";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";

type INPUT = {
    formdata: FormData
}

type OUTPUT = null;

type ServerResponse = OUTPUT;

export default class SendMessage extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        return this.axiosInstance!.post("app/send-message", input.formdata, {
            headers: {
                "Content-Type": "multipart/form-data",
                "X-Device-Public-Key": publicKey
            }
        });
    }

}
