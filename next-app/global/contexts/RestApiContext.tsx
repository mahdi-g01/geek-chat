'use client';

import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import axios, {AxiosInstance} from 'axios';
import {GenericRestMethodClassType, RawRestMethodData, RestMethodOptions} from "@/rest/RestMethod";
import {getPreference} from "@/global/functions/capacitor_preferences";

type ApiClient = AxiosInstance;

const RestApiContext = createContext<{
    isReady: boolean;
    client: ApiClient;
    apiTokenRetrieved: boolean;
    baseUrl: string;
    apiToken: string|null;
    setApiToken: (token: string|null)=>any;
} | undefined>(undefined);

export const RestApiProvider = ({baseUrl, children}: { baseUrl: string, children: React.ReactNode }) => {

    const [apiTokenRetrieved, setApiTokenRetrieved] = useState<boolean>(false);
    const [apiToken, setApiToken] = useState<string|null>(null);

    const client = useMemo(() => {

        const apiClient = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            validateStatus: () => true,
            withCredentials: true,
            withXSRFToken: true,
        });

        apiClient.interceptors.request.use((req) => {
            if(apiToken)
                req.headers.set("Authorization", `Bearer ${apiToken}`)
            return req;
        });

        apiClient.interceptors.response.use((req) => {
            return req;
        });

        return apiClient;
    }, [baseUrl, apiToken]);

    useEffect(() => {
        getPreference("api_token").then((token)=>{
            if(token)
                setApiToken(token)
        }).finally(()=>setApiTokenRetrieved(true))
    }, []);

    return (
        <RestApiContext.Provider value={{client, isReady: !!client, apiToken, setApiToken, baseUrl, apiTokenRetrieved}}>
            {children}
        </RestApiContext.Provider>
    );
};

export const useRestApi = () => {
    const context = useContext(RestApiContext);
    if (!context) {
        throw new Error('useRestApi must be used within an RestApiProvider');
    }
    return context;
};

export function useRestMethod() {
    const {client} = useRestApi();

    return useMemo(() => ({
        execute: async <OUTPUT, INPUT, SERVER_RESPONSE = RawRestMethodData>(
            MethodClass: GenericRestMethodClassType<OUTPUT, INPUT, SERVER_RESPONSE>,
            input?: INPUT,
            options?: RestMethodOptions
        ) => {
            const method = new MethodClass({
                axiosInstance: client,
            });
            return method.launch(input, options);
        }
    }), [client]);
}
