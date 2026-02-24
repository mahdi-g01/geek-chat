import { RestMethod } from "@/rest/RestMethod";
import { AxiosResponse } from "axios";
import { UserPrivate } from "@/rest/types/User";

/** Matches Laravel admin create-user: public_name?, user_name, password, preferences? */
export type CreateUserInput = {
    user_name: string;
    password: string;
    public_name?: string | null;
    preferences?: Record<string, unknown> | null;
};

type OUTPUT = {
    user: UserPrivate;
};

type ServerResponse = OUTPUT;

export default class CreateUser extends RestMethod<OUTPUT, CreateUserInput, ServerResponse> {

    prepareMethod(input: CreateUserInput): Promise<AxiosResponse> {
        return this.axiosInstance!.post("admin/create-user", input);
    }
}
