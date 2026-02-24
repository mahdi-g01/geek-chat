import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {Chat} from "@/rest/types/Chat";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";

type INPUT = {
    receiver_user_id: number|string
}

type OUTPUT = {
    chat: Chat
};

type ServerResponse = OUTPUT;

export default class MakeDialog extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        return this.axiosInstance!.post("app/make-dialog", input, {
            headers: {
                "X-Device-Public-Key": publicKey
            }
        });
    }

}
