import {getStoredPublicKeyBase64} from "@/lib/device_handler";
import { RestMethod } from "@/rest/RestMethod";
import { AxiosResponse } from "axios";

type INPUT = Record<string, never>;

type OUTPUT = null;

type ServerResponse = OUTPUT;

export default class AuthLogout extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        return this.axiosInstance!.get("auth/logout", {
            params: publicKey ? { public_key: publicKey } : undefined,
        });
    }

}
