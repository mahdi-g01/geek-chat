import {cn} from "@/lib/utils";
import * as React from "react";
import {HTMLAttributes} from "react";
import {MessageCircleWarning} from "lucide-react";

export default function Snackbar(
    {className, ...props}:
        HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(
        "bg-primary-foreground text-foreground text-sm py-2 px-4 rounded-full self-center line-clamp-2 -translate-y-20 shadow-lg",
        "flex flex-row gap-2",
        className
    )} {...props}/>
}

export function SnackbarError({children}: {children: React.ReactNode}) {
    return <Snackbar className={"bg-destructive text-primary-foreground"}>
        <MessageCircleWarning/>
        <span>{children}</span>
    </Snackbar>
}

export function SnackbarWarning({children}: {children: string}) {
    return <Snackbar className={"bg-warning text-warning-foreground"}>
        <MessageCircleWarning/>
        <span>{children}</span>
    </Snackbar>
}