'use client'

import React from "react";
import useRootPageChecks from "@/global/hooks/useRootPageChecks";
import useDeviceInfoGenerator from "@/global/hooks/useDeviceInfoGenerator";
import {LoaderIcon} from "lucide-react";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import {useRouter} from "next/navigation";

export default function Page() {

    // Here we first check the login status
    // We redirect user to chat page if it was,
    // If not, we check the startup stage to navigate to startup page
    // if startup system is not finalized, and if not
    // we simply navigate user to login page.

    useDeviceInfoGenerator();

    const router = useRouter();
    const {getDecidedRedirectTarget} = useRootPageChecks();

    useEffectAfterApiReady(() => {
        getDecidedRedirectTarget().then(page => router.replace(page))
    })

    return (
        <div className={"flex-1 flex dark w-svw h-svh overflow-hidden items-center justify-center"}>
            <LoaderIcon className={"animate-spin"}/>
        </div>
    );

}
