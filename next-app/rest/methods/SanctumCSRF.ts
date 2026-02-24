import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = {}

type OUTPUT = {};

type ServerResponse = OUTPUT;
export default class SanctumCSRF extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    requestTag = "csrf(sanctum/csrf-cookie)";

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const data: Record<string, unknown> = {
            ...this.configParameters
        };
        return this.axiosInstance!.get("sanctum/csrf-cookie", data);
    }

}
