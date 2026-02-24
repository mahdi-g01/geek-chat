import { injectDeviceInfo } from "@/lib/device_handler";
import { RestMethod } from "@/rest/RestMethod";
import { AxiosResponse } from "axios";

type INPUT = {
    user_name: string,
    password: string,
    captcha_answer?: string,
    captcha_ts?: string,
    captcha_payload?: string,
}
type OUTPUT = {
    token: string
};
type ServerResponse = OUTPUT;

export default class AuthLogin extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const body = await injectDeviceInfo(input as Record<string, unknown>);
        return this.axiosInstance!.post("auth/login", body);
    }

}
