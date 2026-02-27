'use client';

import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {Chat} from "@/rest/types/Chat";
import UserChats from "@/rest/methods/app/UserChats";
import useLooper from "@/global/hooks/useLooper";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import useSystemSettings from "@/global/contexts/SystemSettingsContext";
import {useRouter, useSearchParams} from "next/navigation";

const ChatListContext = createContext<{
    initialLoading: boolean,
    loading: boolean,
    chats: Chat[],
    openChat: (chat: Chat) => any,
    closeChat: () => void,
    openedChat: Chat | undefined,
    hasOpenedChat: boolean,
    pollingInterval: number,
} | undefined>(undefined);

export const ChatListProvider = ({children}: { children: React.ReactNode }) => {

    const [loadingChats, setLoadingChats] = useState<boolean>(false);
    const [chats, setChats] = useState<Chat[] | undefined>(undefined);
    const [openedChat, setOpenedChat] = useState<Chat | undefined>(undefined);
    const [pollingInterval, setPollingInterval] = useState(1500);

    const router = useRouter();
    const rest = useRestMethod();
    const params = useSearchParams();

    useEffect(() => {
        const openedChatParam = params.get("opened_chat");
        if (openedChatParam == null)
            setOpenedChat(undefined);
        else if (openedChat?.id != openedChatParam){
            setOpenedChat(
                chats?.find(c => c.id == openedChatParam)
            );
        }
    }, [params]);

    const loader = useCallback(() => {
        setLoadingChats(true);
        rest.execute(UserChats)
            .then((res) => {
                setChats(res.chats);
                if (openedChat) {
                    setOpenedChat(res.chats.find(c => c.id == openedChat.id))
                }
            }).catch(() => {

        }).finally(() => setLoadingChats(false))
    }, [openedChat, rest])

    useEffectAfterApiReady(() => {
        loader();
    })

    const systemSettings = useSystemSettings();

    useEffect(() => {
        setPollingInterval(
            Math.max(1500, systemSettings.get("chat_refresh_throttle_rate"))
        );
    }, [systemSettings]);

    useLooper({
        callback: loader,
        interval: pollingInterval,
    });

    const hasOpenedChat = openedChat != undefined;

    const openChat = (chat: Chat) => {
        router.push(`/chat?opened_chat=${chat.id}`);
        setOpenedChat(chat);
    }

    const closeChat = () => {
        router.push(`/chat`)
    }

    return (
        <ChatListContext.Provider value={{
            initialLoading: loadingChats && (chats == undefined),
            loading: loadingChats,
            chats: chats ?? [],
            openChat,
            closeChat,
            openedChat: openedChat,
            hasOpenedChat,
            pollingInterval
        }}>
            {children}
        </ChatListContext.Provider>
    );
};

export const useLiveChatList = () => {
    const context = useContext(ChatListContext);
    if (!context) {
        throw new Error('useChatList must be used within an ChatListProvider');
    }
    return context;
};
