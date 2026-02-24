import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = {
    user_name: string,
    password: string
}

type OUTPUT = null;

type ServerResponse = OUTPUT;

export default class SetupAdmin extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        return this.axiosInstance!.post("startup/setup-admin", input);
    }

}
