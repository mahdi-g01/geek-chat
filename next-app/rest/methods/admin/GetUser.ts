import { RestMethod } from "@/rest/RestMethod";
import { AxiosResponse } from "axios";
import { UserPrivate } from "@/rest/types/User";

type INPUT = {
    user_id: string | number;
};

type OUTPUT = {
    user: UserPrivate;
};

type ServerResponse = { user: UserPrivate | Record<string, unknown> };

export default class GetUser extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        return this.axiosInstance!.get("admin/get-user", {
            params: { user_id: input.user_id },
        });
    }

}
