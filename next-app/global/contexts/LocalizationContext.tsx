'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import fa from "../../translations/fa";
import en from "../../translations/en";
import {getPreference, setPreference} from "@/global/functions/capacitor_preferences";
import {addThousandsSeparator} from "@/lib/utils";

export type Languages = "fa" | "en";

type Fields = (keyof typeof fa) | (keyof typeof en);
type ContextType = {
    language: Languages;
    setLanguage: (lang: Languages) => void;
    dir: "ltr" | "rtl";
    // Text translation helper
    _t: (field: Fields, ...parameters: (string | number)[]) => string;
    // Date formatter
    _d: (input: Date | string, time?: boolean) => string;
    // Format number
    _f: (input: string | number) => string;
}

const LocalizationContext = createContext<ContextType | undefined>(undefined);

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (!context)
        throw new Error('useLocalization must be used within a LocalizationProvider');
    return context;
};

export const LocalizationProvider = ({children}: { children: ReactNode }) => {

    const [language, setLanguageState] = useState<Languages>("fa");

    useEffect(() => {
        getPreference("language").then(val => {
            if (val) setLanguageState(val as Languages);
        })
    }, []);

    const setLanguage = (lang: Languages) => {
        setPreference('language', lang).then(() => {
            setLanguageState(lang);
        });
    };

    const translate = (field: Fields, ...parameters: (string | number)[]) => {
        const source = {
            "fa": fa,
            "en": en
        }[language] as any;
        let translation = source[field] ?? "UN_TRANSLATED";
        parameters.forEach((param) => {
            translation = translation.replace("$(param)", `${param}`);
        });
        return translation;
    };

    const formatDate = (input: Date | string, withTime: boolean = false) => {
        if (input instanceof Date) {
            return input.toLocaleDateString(language);
        } else {
            try {
                const date = new Date(input);
                return date.toLocaleDateString(language) + (withTime ? " "+date.toLocaleTimeString(language) : "");
            } catch (err) {
                console.error(err);
                return "unsupported_date"
            }
        }
    };

    const formatNumber = (input: string | number) => {
        const separated = addThousandsSeparator(input);
        return `${separated}`
    };

    const layoutDir = ["fa", "ar"].includes(language) ? "rtl" : "ltr";

    return (
        <LocalizationContext.Provider value={{
            language,
            dir: layoutDir,
            setLanguage,
            _t: translate,
            _d: formatDate,
            _f: formatNumber,
        }}>
            {children}
        </LocalizationContext.Provider>
    );

};
