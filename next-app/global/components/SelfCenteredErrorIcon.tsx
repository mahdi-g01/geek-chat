import React from "react";
import {InfoIcon} from "lucide-react";
import {cn} from "@/lib/utils";

export default function SelfCenteredErrorIcon({show, text}: { show: boolean, text?: string }) {
    return show &&<div className={cn(
        "absolute flex flex-col gap-2 items-center justify-center left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2"
    )}>
        <InfoIcon
            className={"text-destructive"}/>
        <span className={"text-destructive"}>{text}</span>
    </div>
}
