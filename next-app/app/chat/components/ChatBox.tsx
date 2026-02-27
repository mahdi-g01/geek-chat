import {Chat} from "@/rest/types/Chat";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import useScrollToEnd from "@/app/chat/hooks/useScrollToEnd";
import useMessageInitiator from "@/app/chat/hooks/useMessageInitiator";
import SendMessage from "@/rest/methods/app/SendMessage";
import ChatMessagesList from "@/app/chat/components/ChatMessages";
import ChatComposeBox from "@/app/chat/components/ChatComposeBox";
import {useLiveChatList} from "@/global/contexts/ChatListContext";
import useMessageLoader from "@/app/chat/hooks/useMessageLoader";
import AvatarImage from "@/global/components/AvatarImage";
import PageHeader from "@/global/components/PageHeader";
import {Button} from "@/global/components/ui/button";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import useEncryptedDialogMaker from "@/app/chat/hooks/useEncryptedDialogMaker";
import {LoaderIcon} from "lucide-react";
import useEncryptedDialogHelper from "@/app/chat/hooks/useEncryptedDialogHelper";
import {cn} from "@/lib/utils";

export default function ChatBox({chat}: { chat: Chat }) {


    // *-*-*- States and global hooks

    const [messages, setMessages] = useState<Chat["messages"] | undefined>(chat.messages);

    const chatScrollRef = useRef<HTMLDivElement | null>(null);

    const rest = useRestMethod();

    const {_t} = useLocalization();

    const {openedChat: liveChat, closeChat, openChat} = useLiveChatList();

    const scrollToEnd = useScrollToEnd(chatScrollRef);

    const {
        messageLoader: loadMessages, loadingMessages
    } = useMessageLoader({
        chatId: chat.id
    });

    // *-*-*-*-*-*-*-*-*-*-*-*


    // *-*-*- Memo Functions

    const oldestLoadedMessageTimeStamp = useMemo(() => {
        if (messages == undefined)
            return undefined;

        if (messages.length == 0)
            return undefined;

        return messages[messages.length - 1].created_at;

    }, [messages]);

    const isEncrypted = useMemo(() => {
        return chat.chat_type == "encrypted_dialog";
    }, [chat])

    const isDialog = useMemo(() => {
        return chat.chat_type == "dialog" || chat.chat_type == "encrypted_dialog";
    }, [chat])

    // *-*-*-*-*-*-*-*-*-*-*-*


    // *-*-*- Callback Functions

    const reloadCurrentStack = useCallback((scrollToEndAfterLoad: boolean = false) => {
        loadMessages(oldestLoadedMessageTimeStamp, undefined, "unlimited").then((loadedMessages) => {
            setMessages(loadedMessages)
        }).then(() => {
            if (scrollToEndAfterLoad) {
                setTimeout(() => {
                    scrollToEnd("smooth", 600);
                }, 50)
            }
        })
    }, [loadMessages, oldestLoadedMessageTimeStamp, scrollToEnd])

    const backwardLoadMessages = useCallback(() => {
        loadMessages(undefined, oldestLoadedMessageTimeStamp, 20).then((messages) =>
            setMessages(prev => ([...(prev ?? []), ...(messages ?? [])]))
        )
    }, [loadMessages, oldestLoadedMessageTimeStamp])

    const sendMessage = useCallback((formData: FormData) => {
        // The function that is responsible to send the message
        return rest.execute(SendMessage, {formdata: formData})
            .finally(() => reloadCurrentStack(true));
    }, [reloadCurrentStack, rest])

    // *-*-*-*-*-*-*-*-*-*-*-*


    // *-*-*- Event handler hooks

    const {initialMessagesLoaded} = useMessageInitiator({
        loader: loadMessages,
        messagesSetter: setMessages
    });

    useEffect(() => {
        // This section will reload messages, if we received this chat has new events
        // From the live chat list hook
        if (liveChat?.has_unseen_event)
            reloadCurrentStack(true)

    }, [liveChat, liveChat?.has_unseen_event]);

    useEffect(() => {
        // This is the function to scroll to end when messages loaded initially
        if (initialMessagesLoaded) {
            const to = setTimeout(() => {
                scrollToEnd("smooth");
            }, 500);
            return () => clearTimeout(to);
        }

    }, [initialMessagesLoaded]);

    // *-*-*-*-*-*-*-*-*-*-*-*


    // *-*-*- Encryption handlers

    const encryptedDialogMaker = useEncryptedDialogMaker();

    const handleEncryptedChatCreation = useCallback(() => {
        if (chat.dialog_target_user_id == null)
            return;

        encryptedDialogMaker.make(chat.dialog_target_user_id)
            .then(res => {
                openChat(res.chat)
            })
    }, [chat.dialog_target_user_id, encryptedDialogMaker, openChat])

    const [encryptedChatCryptoKey, setEncryptedChatCryptoKey] = useState<CryptoKey | null>(null);
    const {getCryptoKey} = useEncryptedDialogHelper();

    useEffect(() => {
        if (chat.encryption_property != null)
            getCryptoKey(chat.encryption_property).then(cc => (cc) ? setEncryptedChatCryptoKey(cc) : null)
        else setEncryptedChatCryptoKey(null)
    }, [chat.encryption_property, getCryptoKey]);

    // *-*-*-*-*-*-*-*-*-*-*-*


    return <div className={cn(
        "w-full h-full flex flex-col bg-card overflow-hidden relative",
        isEncrypted && "border-primary lg:!rounded-[12px] border-[8px]"
    )}>

        {/*Header*/}
        <PageHeader onCloseClick={closeChat} ImageComponent={<AvatarImage chat={chat} size={55}/>}
                    title={chat?.title ?? ""} subTitle={chat?.description ?? undefined}
                    otherActionIcons={(isDialog && !isEncrypted)
                        ? <Button size={"sm"} className={"w-[110px] text-xs md:w-[140px] md:text-sm"}
                                  onClick={handleEncryptedChatCreation}>
                            {encryptedDialogMaker.making
                                ? <LoaderIcon className={"animate-spin"}/>
                                : _t("start_encrypted_dialog")
                            }
                        </Button>
                        : <></>}/>

        {(isDialog && !isEncrypted) &&
            <WarningChip>
                {_t("warning_not_encrypted_dialog")}
            </WarningChip>}

        {(isEncrypted) && <WarningChip className={"bg-destructive text-white"}>
            {_t("warning_encrypted_dialog")}
        </WarningChip>}

        {/*Messages*/}
        <ChatMessagesList messages={messages} loadingMessages={loadingMessages}
                          cryptoKey={encryptedChatCryptoKey}
                          backwardLoadMessages={backwardLoadMessages} ref={chatScrollRef}/>

        {/*Message Box*/}
        <ChatComposeBox handleMessageSend={sendMessage} chatId={chat?.id}
                        cryptoKey={encryptedChatCryptoKey}/>

    </div>

}

function WarningChip({className, ...props}: React.ComponentProps<"div">) {
    return <div
        className={`w-[calc(100%-50px)] absolute top-[100px] text-center bg-background text-xs md:text-sm left-[50%] -translate-x-1/2 rounded-md py-1 px-0.5 outline-1 ${className}`}
        {...props}/>
}