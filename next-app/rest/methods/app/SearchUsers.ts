import {RestMethod} from "@/rest/RestMethod";
import {AxiosResponse} from "axios";
import {UserPublic} from "@/rest/types/User";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";

type INPUT = {
    query: string
}

type OUTPUT = {
    users: UserPublic[]
};

type ServerResponse = OUTPUT;

export default class SearchUsers extends RestMethod<OUTPUT, INPUT, ServerResponse> {

    async prepareMethod(input: INPUT): Promise<AxiosResponse> {
        const publicKey = await getStoredPublicKeyBase64();
        return this.axiosInstance!.get("app/search-users", {
            headers: {
                "X-Device-Public-Key": publicKey
            },
            params: input
        });
    }

}
