import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = null

type OUTPUT = {
    messages: string[]
};

type ServerResponse = OUTPUT;

export default class CheckRequirements extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(): Promise<AxiosResponse> {
        return this.axiosInstance!.get("startup/check-requirements");
    }

}
