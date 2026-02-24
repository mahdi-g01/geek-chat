import {UserPublic} from "@/rest/types/User";
import Link from "next/link";
import {cn} from "@/lib/utils";
import AvatarImage from "@/global/components/AvatarImage";
import React from "react";

export function UserChip({user}: {user: UserPublic}){
    return <Link href={`/admin/users/details?user_id=${user.id}`} className={cn(
        "flex items-center gap-2 rounded-lg p-3",
        "bg-background hover:brightness-105 hover:outline transition-all",
    )}>
        <div>
            <AvatarImage user={user} />
        </div>
        <div className={"flex flex-col gap-1"}>
            <h6 className={"text-md line-clamp-1"}>{user.public_name}</h6>
            <p className={"text-sm"}>id: {user.id}</p>
        </div>
    </Link>
}

