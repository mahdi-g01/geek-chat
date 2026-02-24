import { RestMethod } from "@/rest/RestMethod";
import { AxiosResponse } from "axios";
import { UserPrivate } from "@/rest/types/User";

type INPUT = {
    user_id: string | number;
};

type OUTPUT = {
    user: UserPrivate;
};

type ServerResponse = OUTPUT;

export default class BanUser extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        return this.axiosInstance!.post("admin/ban-user", input);
    }
}
