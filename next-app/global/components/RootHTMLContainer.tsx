'use client'

import React from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";

export default function RootHTMLContainer({children}: { children: React.ReactNode }) {

    const {language} = useLocalization();

    const isRtl = ["fa"].includes(language);

    return (
        <html lang={language} dir={isRtl ? "rtl" : "ltr"}>
        <body className={`antialiased flex flex-1 h-svh max-h-svh`}>

        {children}

        </body>
        </html>
    )
}
