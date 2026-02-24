import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {AdminDashboardInfo} from "@/rest/types/AdminDashboardInfo";

type INPUT = null;

type OUTPUT = AdminDashboardInfo;

type ServerResponse = OUTPUT;

export default class DashboardInfo extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(): Promise<AxiosResponse> {
        return this.axiosInstance!.get("admin/admin-dashboard");
    }

}
