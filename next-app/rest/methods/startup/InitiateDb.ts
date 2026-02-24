import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = null

type OUTPUT = null;

type ServerResponse = OUTPUT;

export default class InitiateDb extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(): Promise<AxiosResponse> {
        return this.axiosInstance!.post("startup/initiate-db");
    }

}
