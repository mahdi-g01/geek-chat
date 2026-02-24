import {UserPublic} from "@/rest/types/User";
import React from "react";
import {Chat} from "@/rest/types/Chat";

export default function AvatarImage(
    {user, chat, size = 50}: { user?: UserPublic | undefined, chat?: Chat, size?: number }) {

    const decidedAvatar = chat?.avatar_url ?? user?.avatar_url ?? null;
    const decidedRandomColor =
        pastelColors[Number(`${chat?.dialog_target_user_id ?? user?.id ?? chat?.id}`.at(-1))] ?? pastelColors[0]
    const decidedAlt = chat?.title ?? user?.public_name ?? "";

    return <div className={"rounded-full"} style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
    }}>
        {(decidedAvatar
            ? <img className={"w-full h-full rounded-full"} alt={decidedAlt} src={decidedAvatar}/>
            : <div className={"w-full h-full rounded-full"} style={{
                backgroundColor: decidedRandomColor
            }}>
                <img className={"w-full h-full invert"} src={"/avatar-placeholder.png"} alt={"No avatar"}/>
            </div>
        )}
    </div>

}

const pastelColors: { [key: number]: string } = {
    0: "#E05297", // strong rose
    1: "#E67E22", // deep apricot
    2: "#D4AC0D", // golden pastel
    3: "#27AE60", // rich mint green
    4: "#2D9CDB", // vivid sky blue
    5: "#8E44AD", // confident lavender
    6: "#E17055", // coral pop
    7: "#43AA8B", // teal pastel
    8: "#5E81F4", // bold periwinkle
    9: "#D63384"  // saturated pink
};
