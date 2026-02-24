import {XIcon} from "lucide-react";
import React from "react";
import {useRouter} from "next/navigation";

export default function PageHeader(
    {
        ImageComponent,
        onCloseClick,
        title,
        subTitle,
        otherActionIcons
    }: {
        ImageComponent?: React.ReactNode,
        otherActionIcons?: React.ReactNode,
        title: string,
        subTitle?: string,
        onCloseClick?: ()=>any
    }) {

    const router = useRouter();

    const handleCloseClock = ()=>{
        if (onCloseClick)
            return onCloseClick();
        router.back();
    }

    {/*Header*/}
    return <div className={"w-full border-border border-b flex items-center px-4 py-4 gap-4"}>
        {ImageComponent}
        <div className={"grow"}>
            <h6 className={"line-clamp-1"}>{title}</h6>
            {subTitle && <p className={"line-clamp-1 text-sm text-muted-foreground"}>{subTitle}</p>}
        </div>
        <div className={"flex gap-4 items-center"}>
            {otherActionIcons}
            <div className={"w-[40px] h-[40px] flex items-center justify-center hover:bg-card-foreground/10 cursor-pointer rounded-full"}
                 onClick={handleCloseClock}>
                <XIcon/>
            </div>
        </div>
    </div>
}