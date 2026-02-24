import React, {useEffect, useMemo, useState} from "react";
import {Chat, ChatMessages} from "@/rest/types/Chat";
import {byteToMegabyte, cn} from "@/lib/utils";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useUser} from "@/global/contexts/UserContext";
import AvatarImage from "@/global/components/AvatarImage";
import useBlobDownloader from "@/global/hooks/useBlobDownloader";
import {DownloadIcon, FileIcon, LoaderIcon} from "lucide-react";
import ReactMarkdown from 'react-markdown'
import {Button} from "@/global/components/ui/button";
import useEncryptedDialogHelper from "@/app/chat/hooks/useEncryptedDialogHelper";

export default function ChatMessagesList(
    {
        messages,
        backwardLoadMessages,
        loadingMessages,
        cryptoKey,
        ...divProps
    }: {
        messages: Chat["messages"],
        backwardLoadMessages: () => void,
        loadingMessages: boolean,
        cryptoKey?: CryptoKey | null
    } & React.ComponentProps<'div'>) {

    const reversed = useMemo(() => [...messages ?? []].reverse(), [messages]);
    const {_t} = useLocalization();

    return <div className={"w-full border-border border-b overflow-y-scroll flex-grow space-y-6 py-6 pt-20"} {...divProps}>

        <div className={"w-full flex items-center justify-center"}>
            {loadingMessages
                ? <LoaderIcon className={"animate-spin my-[5px]"} size={26}/>
                : <Button onClick={backwardLoadMessages} variant={"secondary"}>
                    {_t("load_more_messages")}
                </Button>}
        </div>

        {/* Only decrypted message goes into bubble */}
        {reversed.map((message, index) => {
            return <MessageBubble key={`${message.id}-${index}`} message={message} cryptoKey={cryptoKey}/>
        })}

    </div>
}

function MessageBubble({message, cryptoKey}: {
    message: NonNullable<Chat["messages"]>[number],
    cryptoKey?: CryptoKey | null
}) {

    const {user} = useUser();
    const {_d} = useLocalization();

    const isMe = message.user?.id == user?.id;

    const {decrypt} = useEncryptedDialogHelper();

    const [processedMessageBody, setProcessedMessageBody] = useState("");

    useEffect(() => {

        if (cryptoKey)
            decrypt(cryptoKey, message.message_body)
                .then(message => {
                    setProcessedMessageBody(message)
                })
        else setProcessedMessageBody(message.message_body)

    }, [cryptoKey, decrypt, message.message_body]);

    return <div className={cn(
        "px-4 gap-4",
        `flex w-full items-end ${isMe ? "flex-row justify-start" : "flex-row-reverse"}`,
    )}>

        <AvatarImage user={message.user}/>

        <div
            className={"bg-background rounded-md p-3 gap-3 flex flex-col min-w-[100px] max-w-[300px] lg:max-w-[500px] overflow-hidden"}>
            {message.files?.map(file => {
                return <FileView key={file.id} file={file} messageId={message.id} chatId={message.chat_id}/>
            })}
            <ReactMarkdown>
                {processedMessageBody}
            </ReactMarkdown>
        </div>

        <span className={"text-sm font-bold text-muted-foreground"}>
            <small>{_d(message.created_at, true)}</small>
        </span>

    </div>
}

function FileView({file, messageId, chatId}: {
    file: NonNullable<ChatMessages["files"]>[number],
    messageId: number | string,
    chatId: number | string
}) {

    const isImage = ["png", "jpg", "jpeg", "webp", "avif", "gif"].includes(file.extension);
    const previewThePossibleImageFile = isImage && file.display_type == "prefer_preview";

    const {fetch, fetchingBlob, download, fileBlob} = useBlobDownloader({
        file_id: file.id,
        file_name: file.name,
        chat_id: chatId,
        message_id: messageId
    });

    useEffect(() => {
        if (previewThePossibleImageFile)
            fetch();
    }, []);

    if (previewThePossibleImageFile)
        return <div className={"w-full"}>
            {fetchingBlob ? <div className={"w-[300px] h-[400px] flex items-center justify-center"}>
                <LoaderIcon className={"animate-spin"}/>
            </div> : (
                fileBlob &&
                <img alt={file.name} onClick={download}
                     className={"w-full object-cover max-h-[400px] cursor-pointer rounded-sm"}
                     src={URL.createObjectURL(fileBlob)}/>
            )}
        </div>

    else return <div onClick={download} className={cn(
        "flex bg-card-foreground/6 min-w-[250px] w-full p-3 gap-4 rounded-sm",
        "group cursor-pointer hover:bg-card-foreground/10"
    )}>

        <div className={"bg-primary p-4 rounded-full"}>
            {fetchingBlob ? <LoaderIcon className={"animate-spin"} color={"white"}/> : <>

                <div className={"hidden group-hover:contents"}>
                    <DownloadIcon color={"white"}/>
                </div>

                <div className={"contents group-hover:hidden"}>
                    <FileIcon color={"white"}/>
                </div>

            </>}
        </div>

        <div className={"w-full overflow-hidden flex flex-col justify-between"}>
            <h6 className={"line-clamp-1"}>{file.name}</h6>
            <div className={"flex justify-between text-sm text-muted-foreground"}>
                <span>{file.extension.toUpperCase()}</span>
                {file.size && <span style={{direction: "ltr"}}>{`${byteToMegabyte(file.size)} mb`}</span>}
            </div>
        </div>

    </div>
}