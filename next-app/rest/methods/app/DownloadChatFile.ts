import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";

type INPUT = {
    chat_id: any,
    message_id: any,
    file_id: any,
}

type OUTPUT = Blob;

type ServerResponse = Blob;

export default class DownloadChatFile extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        return this.axiosInstance!.get(`app/download-file`, {
            headers: {
                "X-Device-Public-Key": publicKey
            },
            responseType: "blob",
            params: input
        });
    }

}
