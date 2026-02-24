import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = Record<string, string | null>;
type OUTPUT = object;
type ServerResponse = OUTPUT;

export default class SetSystemSettings extends RestMethod<OUTPUT, INPUT, ServerResponse> {
    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        return this.axiosInstance!.post("admin/system-settings", input);
    }
}
