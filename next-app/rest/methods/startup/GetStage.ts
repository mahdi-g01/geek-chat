import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = null

type OUTPUT = {
    stage?: "stage_final_app_ready" | string
};

type ServerResponse = OUTPUT;

export default class GetStage extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(): Promise<AxiosResponse> {
        return this.axiosInstance!.get("startup/get-stage");
    }

}
