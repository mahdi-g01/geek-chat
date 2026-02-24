import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {UserPrivate} from "@/rest/types/User";

type INPUT = {}

type OUTPUT = {
    base64_url: string,
    timestamp: string,
    payload: string
};

type ServerResponse = OUTPUT
export default class Captcha extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    requestTag = "captcha";

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const data: Record<string, unknown> = {
            ...this.configParameters
        };

        return this.axiosInstance!.get("captcha", data);
    }

}
