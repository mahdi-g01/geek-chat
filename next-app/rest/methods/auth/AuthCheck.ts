import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {UserPrivate} from "@/rest/types/User";

type INPUT = {}

type OUTPUT = {
    user: UserPrivate
};

type ServerResponse = OUTPUT;
export default class AuthCheck extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(): Promise<AxiosResponse> {
        return this.axiosInstance!.get("auth");
    }

}
