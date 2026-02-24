import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";

type INPUT = {
    user_id: string | number;
};

type OUTPUT = object;

type ServerResponse = OUTPUT;

export default class DeleteUser extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    prepareMethod(input: INPUT): Promise<AxiosResponse> {
        return this.axiosInstance!.delete("admin/delete-user", {
            data: { user_id: input.user_id },
        });
    }

}
