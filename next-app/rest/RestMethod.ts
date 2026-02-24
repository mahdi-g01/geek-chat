import {AxiosInstance, AxiosResponse, isAxiosError} from "axios";
import {getPreference, removePreference, setPreference} from "@/global/functions/capacitor_preferences";

export type ResponseType<T> = {
    status: number,
    data: T,
    message: string,
}
export type ResponseError = {
    message: string,
    code: number
}

export type RawRestMethodData = { [p: string]: string | number | boolean | object };
export type RestMethodConstructorType = {
    axiosInstance: AxiosInstance,
};
export type GenericRestMethodClassType<O, I = undefined, SR = RawRestMethodData> =
    new (args: RestMethodConstructorType) => RestMethod<O, I, SR>;
export type RestMethodOptions = {
    useCache: boolean;
    cacheTTL?: number;
}
export type RestMethodCache<DATA_TYPE> = {
    invalidate_at: number;
    data: DATA_TYPE
}

export abstract class RestMethod<OUTPUT, INPUT = undefined, SERVER_RESPONSE = RawRestMethodData> {

    protected axiosInstance?: AxiosInstance = undefined;
    protected configParameters?: { [key: string]: string | number } = undefined
    protected isDebugMode: boolean = false;

    constructor(args: RestMethodConstructorType) {
        this.axiosInstance = args.axiosInstance;
    }

    public abstract prepareMethod(input: INPUT | undefined): Promise<AxiosResponse>;

    protected rawDataTransformer(rawData: SERVER_RESPONSE, originalBody: ResponseType<OUTPUT>): OUTPUT {
        return (rawData as any as OUTPUT);
    };

    public requestTag: string = this.toString();

    private isApiError(response: AxiosResponse): boolean {
        if (response == undefined)
            return false;
        if (response.data == undefined)
            return false;
        if (response.data.status == undefined)
            return false;
        if (response.data.message == undefined)
            return false;
        if (!response.data.status)
            return true;
        return !response.status.toString().startsWith("20");
    }

    private isValidApiResponse(response: AxiosResponse): boolean {
        if (response == undefined)
            return false;
        if (response.data == undefined)
            return false;
        if (response.data.status == undefined)
            return false;
        return true;
    }

    private log(text: string) {
        if (this.isDebugMode)
            console.log(text);
    }

    private async getCache() {
        const cacheKey = `cache_${this.requestTag}`;
        try {
            const cache = await getPreference(cacheKey);
            if (cache == null)
                return null;

            const decoded = JSON.parse(cache) as RestMethodCache<OUTPUT>;
            if (Date.now() > decoded.invalidate_at) {
                await removePreference(cacheKey)
                return null;
            }

            return decoded.data;
        } catch (err) {
            this.log(`${err}`);
            return null;
        }
    }

    private async setCache(data: OUTPUT, ttl: number) {
        try {
            await setPreference(`cache_${this.requestTag}`, JSON.stringify({
                data, invalidate_at: Date.now() + ttl
            }))
            return true;
        } catch (err) {
            this.log(`${err}`);
            return false;
        }
    }

    public async launch(input?: INPUT | undefined, options: RestMethodOptions = {
        useCache: false
    }): Promise<OUTPUT> {

        if (options.useCache) {
            if (input)
                this.log("You are using cache, while having inputs on you request! " +
                    "Be careful of doing that, you might receive cached data " +
                    "instead of dynamic response based on your input")
            const cache = await this.getCache();
            if (cache)
                return cache;
        }

        return new Promise<OUTPUT>(async (resolve, reject) => {
            try {
                const response = await this.prepareMethod(input);
                if (response.config.responseType == "blob")
                    resolve(response.data)
                if (!this.isValidApiResponse(response)) {
                    this.log(`API server responded with an invalid data type: ${this.requestTag}`);
                    reject({
                        message: "Invalid response data type",
                        code: response.status
                    })
                }
                if (this.isApiError(response)) {
                    this.log(`API server error after requesting: ${this.requestTag}`);
                    reject({
                        message: (response.data as ResponseType<OUTPUT>).message,
                        code: (response.data as ResponseType<OUTPUT>).status
                    })
                }
                this.log(`Successfully fetched api: ${this.requestTag}`);
                try {
                    const transformedResponse = this.rawDataTransformer((response.data).data, (response.data));
                    if (options.useCache)
                        await this.setCache(transformedResponse, options.cacheTTL ?? (3600 * 48 * 1000))

                    resolve(transformedResponse);
                } catch (err) {
                    this.log(`Transformation error while requesting: ${this.requestTag}`);
                    reject({
                        message: `${err}`,
                        code: -1
                    })
                }
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.code === 'ERR_NETWORK') {
                        this.log(`Network error while requesting: ${this.requestTag}`);
                    } else if (error.code === 'ECONNABORTED') {
                        this.log(`Request timeout while requesting: ${this.requestTag}`);
                    } else if (!error.response) {
                        this.log(`No response from server while requesting: ${this.requestTag}`);
                    } else {
                        this.log(`HTTP Error while requesting: ${this.requestTag}: ${error.response.status}`);
                    }
                    reject({
                        message: error.message,
                        code: error.code
                    })
                } else {
                    this.log(`Unknown api error while requesting: ${this.requestTag}`);
                    reject({
                        message: `Unknown api error while requesting: ${this.requestTag}`,
                        code: -1
                    })
                }
            }
        })
    }

}
