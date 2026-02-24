'use client';

import React, {createContext, useContext, useEffect, useState} from 'react';
import {useRestMethod} from "@/global/contexts/RestApiContext";
import SystemSettings from "@/rest/methods/SystemSettings";
import {Languages, useLocalization} from "@/global/contexts/LocalizationContext";

const defaultSettings = {
    chat_refresh_throttle_rate: 5000,
    encryption_activated: false,
    allow_user_signup: true,
    stealth_mode_activated: false,
    maximum_file_size: 50000,
    language: "en",
    primary_color: "#000",
    app_name: "GeekChat",
    auth_captcha_activated: "GeekChat",
    allow_sending_files: true,
    accepted_file_mimes: "jpg,jpeg,png,gif,mp4,zip,rar,mp3"
};

const SystemSettingsContext = createContext<{
    settings: typeof defaultSettings,
    setSettings: (val: any) => void
} | undefined>(undefined);

export const SystemSettingsProvider = ({children}: { children: React.ReactNode }) => {

    const [settings, setSettings] = useState(defaultSettings);

    const rest = useRestMethod();
    const {setLanguage} = useLocalization();

    useEffect(() => {
        rest.execute(SystemSettings, null)
            .then(res => {
                const fetchedSettings: Record<string, string|boolean|number> = {};
                res.settings.forEach((item)=>{
                    fetchedSettings[item.key] = item.value;
                });
                setSettings(fetchedSettings as typeof defaultSettings);
                if (fetchedSettings.language != undefined)
                    setLanguage(fetchedSettings.language as Languages);
            })
    }, []);

    return (
        <SystemSettingsContext.Provider value={{settings, setSettings}}>
            {children}
        </SystemSettingsContext.Provider>
    );
};


export default function useSystemSettings() {

    const context = useContext(SystemSettingsContext);
    if (!context) {
        throw new Error('useSystemSettings must be used within an SystemSettingsProvider');
    }

    const {settings, setSettings} = context

    return {
        set: function <K extends (keyof typeof settings)>(key: K, val: typeof defaultSettings[K]) {
            setSettings((prev: any) => ({...prev, [key]: val}))
        },
        get: function <K extends (keyof typeof settings)>(key: K) {
            return settings[key] ?? undefined;
        },
    }

}