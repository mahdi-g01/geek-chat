'use client'

import React from "react";
import ChatBox from "@/app/chat/components/ChatBox";
import ChatsList from "@/app/chat/components/ChatsList";
import {useLiveChatList} from "@/global/contexts/ChatListContext";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {cn} from "@/lib/utils";
import PageResponsiveBoxContainer from "@/global/components/PageResponsiveBoxContainer";

export default function Page() {

    const {_t} = useLocalization();
    const {hasOpenedChat, openedChat} = useLiveChatList();

    return (
        <PageResponsiveBoxContainer>

            <div className={cn("flex-1/4 border-e border-border overflow-y-scroll relative rounded-lg")}>
                <ChatsList/>
            </div>

            <div className={cn(
                "h-full",
                hasOpenedChat ? "md:block" : "hidden md:block",
                "absolute z-10 top-0 left-0 w-full h-full",
                "md:block md:relative md:h-full md:flex-3/4"
            )}>

                {(!hasOpenedChat) && <div className={"w-full h-full flex items-center justify-center"}>
                    <span className={"text-sm text-muted-foreground"}>{_t("blank_chat_placeholder")}</span>
                </div>}

                {(hasOpenedChat && openedChat) && <ChatBox chat={openedChat} key={openedChat.id}/>}

            </div>

        </PageResponsiveBoxContainer>
    );
}