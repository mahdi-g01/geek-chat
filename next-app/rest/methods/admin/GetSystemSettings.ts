import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {normalizeSystemSettings} from "@/rest/utils/normalizeSystemSettings";

type INPUT = null;

type OUTPUT = {
    settings: { key: string;  title: string; value: string | boolean | number }[];
};

type ServerResponse = OUTPUT;

export default class GetSystemSettings extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(): Promise<AxiosResponse> {
        return this.axiosInstance!.get("admin/system-settings");
    }

    protected rawDataTransformer(rawData: ServerResponse): OUTPUT {
        return {
            settings: normalizeSystemSettings(rawData.settings),
        };
    }

}
