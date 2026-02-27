import type {Metadata} from "next";
import "./globals.css";
import React, {Suspense} from "react";
import {RestApiProvider} from "@/global/contexts/RestApiContext";
import {UserProvider} from "@/global/contexts/UserContext";
import {LocalizationProvider} from "@/global/contexts/LocalizationContext";
import {SystemSettingsProvider} from "@/global/contexts/SystemSettingsContext";
import RootHTMLContainer from "@/global/components/RootHTMLContainer";

export const metadata: Metadata = {
    title: "GeekChat",
    description: "Easy to deploy web-based messenger, powered by Laravel API and Next.js",
    manifest: "/manifest.json",
};

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {

    return (

        <RestApiProvider baseUrl={process.env.API_URL_PREFIX ?? ""}>
            <LocalizationProvider>
                <SystemSettingsProvider>
                    <UserProvider>
                        <RootHTMLContainer>
                            <Suspense>
                                    {children}
                            </Suspense>
                        </RootHTMLContainer>
                    </UserProvider>
                </SystemSettingsProvider>
            </LocalizationProvider>
        </RestApiProvider>

    );

}
