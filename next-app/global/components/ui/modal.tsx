import * as React from "react"
import {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"
import {CrossIcon, X} from "lucide-react";

function ModalContainer({className, ...props}: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(
        "w-full bg-card max-w-[400px] relative flex flex-col shadow-lg rounded-3xl px-6 py-3 text-card-foreground",
        className
    )} {...props}/>
}

function ModalHeader({className, children, ...props}: HTMLAttributes<HTMLDivElement>) {

    const onCloseClick = () => {
        if (window.history.state.rek_modal)
            window.history.back();
    }

    return <div className={cn("flex w-full items-center", className)} {...props}>
        <div className={"flex-1"}>
            {children}
        </div>
        <div className={"hover:bg-card-foreground/10 rounded-full p-2 cursor-pointer"}>
            <X onClick={onCloseClick} />
        </div>
    </div>
}

export {ModalContainer, ModalHeader}
