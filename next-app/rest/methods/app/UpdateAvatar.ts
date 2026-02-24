import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";

type INPUT = {
    image: File | Blob
}

type OUTPUT = [];

type ServerResponse = OUTPUT;

export default class UpdateAvatar extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        const formDate = new FormData();
        formDate.append("image", input.image);

        return this.axiosInstance!.post("app/update-avatar", formDate, {
            headers: {
                "Content-Type": "multipart/form-data",
                "X-Device-Public-Key": publicKey
            }
        });
    }

}
