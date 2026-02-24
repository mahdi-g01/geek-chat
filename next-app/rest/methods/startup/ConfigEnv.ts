import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = {
    engine: string,
    host: string,
    port: string,
    database: string,
    username: string,
    password: string,
    language: string,
}

type OUTPUT = {
    stage?: "stage_final_app_ready" | string
};

type ServerResponse = OUTPUT;

export default class ConfigEnv extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        return this.axiosInstance!.post("startup/config-env", input);
    }

}
