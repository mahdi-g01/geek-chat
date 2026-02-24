import { RestMethod } from "@/rest/RestMethod";
import { AxiosResponse } from "axios";
import { UserPrivate } from "@/rest/types/User";

/** Matches Laravel admin update-user: user_id, public_name?, user_name?, password?, preferences?, bio_text? */
export type UpdateUserInput = {
    user_id: string | number;
    public_name?: string | null;
    user_name?: string | null;
    password?: string | null;
    preferences?: Record<string, unknown> | null;
    bio_text?: string | null;
};

type OUTPUT = {
    user: UserPrivate;
};

type ServerResponse = OUTPUT;

export default class UpdateUser extends RestMethod<OUTPUT, UpdateUserInput, ServerResponse> {

    prepareMethod(input: UpdateUserInput): Promise<AxiosResponse> {
        return this.axiosInstance!.put("admin/update-user", input);
    }
}
