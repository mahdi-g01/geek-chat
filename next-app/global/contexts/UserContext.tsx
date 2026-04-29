'use client';

import React, {createContext, useCallback, useContext, useState} from 'react';
import {UserPrivate} from "@/rest/types/User";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import {useRestApi, useRestMethod} from "@/global/contexts/RestApiContext";
import AuthCheck from "@/rest/methods/auth/AuthCheck";
import AuthLogout from "@/rest/methods/auth/AuthLogout";
import {getPreference, removePreference} from "@/global/functions/capacitor_preferences";
import {ResponseError} from "@/rest/RestMethod";

const UserContext = createContext<{
    user: UserPrivate | undefined,
    setUser: (u: UserPrivate | undefined) => any,
    reloadUserInfo: () => any,
    logoutUser: () => Promise<unknown>,
    isLoggedIn: () => Promise<boolean>,
} | undefined>(undefined);

export const UserProvider = ({children}: { children: React.ReactNode }) => {

    const [user, setUser] = useState<UserPrivate | undefined>(undefined);

    const {apiToken, setApiToken} = useRestApi();
    const rest = useRestMethod();

    const reloadUserInfo = useCallback(() => {
        if (apiToken)
            rest.execute(AuthCheck)
                .then(res => setUser(res.user))
    }, [rest, apiToken])

    const logoutUser = useCallback(() => {
        return new Promise((resolve, reject) => {
            rest.execute(AuthLogout)
                .then(() => {
                    removePreference("api_token").then(()=>{
                        setApiToken(null);
                        setUser(undefined);
                        resolve(true)
                    })
                })
                .catch((err: ResponseError) => {
                    console.log(err)
                    if (Number(err.code) == 401) {
                        removePreference("api_token").then(()=>{
                            setApiToken(null);
                            setUser(undefined);
                            resolve(true)
                        })
                    } else reject()
                });
        });
    }, [rest, setApiToken])

    useEffectAfterApiReady(() => {
        reloadUserInfo();
    });

    const isLoggedIn = async () => {
        const token = await getPreference("api_token");
        return token != null;
    }

    return (
        <UserContext.Provider value={{user, setUser, reloadUserInfo, logoutUser, isLoggedIn}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useRestApi must be used within an UserProvider');
    }
    return context;
};
