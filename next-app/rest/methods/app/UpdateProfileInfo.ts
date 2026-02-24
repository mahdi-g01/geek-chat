import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";

type INPUT = {
    formdata: FormData
}

type OUTPUT = [];

type ServerResponse = OUTPUT;

export default class UpdateProfileInfo extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        return this.axiosInstance!.post("app/update-profile", input.formdata, {
            headers: {
                "X-Device-Public-Key": publicKey
            }
        });
    }

}
