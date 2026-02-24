'use client'
import React from "react";
import {ChatListProvider} from "@/global/contexts/ChatListContext";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import {useUser} from "@/global/contexts/UserContext";
import {useRouter} from "next/navigation";

export default function Layout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {

    const {user, isLoggedIn} = useUser();
    const router = useRouter();

    useEffectAfterApiReady(()=>{
        isLoggedIn().then(is=>{
            if (!is)
                router.replace("/login")
        })
    });

    return (
        <ChatListProvider>
            {children}
        </ChatListProvider>
    );

}
