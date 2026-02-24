import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {UserPrivate} from "@/rest/types/User";

type INPUT = {}
type OUTPUT = {
    auth_needs_captcha: boolean
};
type ServerResponse = OUTPUT;

export default class AuthNeedsCaptcha extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(): Promise<AxiosResponse> {
        return this.axiosInstance!.get("auth/needs-captcha");
    }

}
