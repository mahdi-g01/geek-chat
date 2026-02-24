import React, {ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {addDotPrefixToFileExtensionList, cn} from "@/lib/utils";
import {Loader, Paperclip, SendIcon} from "lucide-react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import useSystemSettings from "@/global/contexts/SystemSettingsContext";
import {ResponseError} from "@/rest/RestMethod";
import useEncryptedDialogHelper from "@/app/chat/hooks/useEncryptedDialogHelper";

export default function ChatComposeBox(
    {
        handleMessageSend,
        chatId,
        cryptoKey,
        ...fromProps
    }: {
        chatId?: number | string,
        handleMessageSend: (formData: FormData) => Promise<any>,
        cryptoKey?: CryptoKey | null
    } & React.ComponentProps<'form'>) {

    const formRef = useRef<HTMLFormElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [sendingMessage, setSendingMessage] = useState(false);
    const [errorText, setErrorText] = useState<string | undefined>(undefined);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const {_t} = useLocalization();
    const systemSettings = useSystemSettings();

    const {encrypt} = useEncryptedDialogHelper();

    const onMessageSuccessfullySent = useCallback(() => {
        formRef.current?.reset();
    }, []);

    const onMessageSendingFail = useCallback((message: string) => {
        setErrorText(message)
    }, []);

    const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSendingMessage(true);
        setErrorText(undefined);
        const form = (e.target as HTMLFormElement);
        const formData = new FormData(form);

        if (cryptoKey != null) {
            // Encrypt of cryptoKey provided
            const encrypted = await encrypt(cryptoKey, formData.get("message")?.toString() ?? "")
            formData.set("message", encrypted)
        }

        handleMessageSend(formData).then(() => {
            onMessageSuccessfullySent();
        }).catch((err: ResponseError) => {
            onMessageSendingFail(err.message);
        }).finally(() => setSendingMessage(false));
    }

    const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.target.files)
    }

    const triggerFileInputClick = () => {
        fileInputRef.current?.click();
    }

    const hasFile = (selectedFiles?.length ?? 0) != 0;

    // Auto error text hider
    useEffect(() => {
        if (errorText) {
            const to = setTimeout(()=>{
                setErrorText(undefined)
            }, 2000);

            return () => clearTimeout(to);
        }
    }, [errorText]);
    
    const sendingFilesAllowed = useMemo(()=>{
        return systemSettings.get("allow_sending_files") && (cryptoKey == null /* Encrypted chats doesnt allow files */)
    }, [cryptoKey, systemSettings]);

    return <form className={"w-full border-border border-b flex items-center relative"}
                 encType={"multipart/form-data"} onSubmit={onFormSubmit} ref={formRef}>

        <input type={"hidden"} name={"chat_id"} value={chatId}/>

        <textarea name={"message"} placeholder={_t("message_box_placeholder")}
                  disabled={sendingMessage} rows={2} required={!hasFile}
                  className={"w-full outline-none resize-none px-2 py-3"}/>

        {errorText && <div className={cn(
            "absolute w-full left-0 -top-8",
            "bg-background text-destructive font-bold",
            "flex gap-2 items-center justify-center px-2 py-1"
        )}>
            {errorText}
        </div>}

        {sendingFilesAllowed && <>

            <div className={cn(
                "relative hover:bg-primary/10 cursor-pointer w-[50px] h-[50px]",
                "flex items-center justify-center rounded-md me-2"
            )} onClick={triggerFileInputClick}>
                <Paperclip color={"var(--muted-foreground)"}/>
                {hasFile && <span className={cn(
                    "absolute bg-primary w-[20px] h-[20px] text-primary-foreground rounded-full text-xs",
                    "flex items-center justify-center opacity-75 top-1 left-1"
                )}>{selectedFiles?.length}</span>}
            </div>

            <input type={"file"} name={"files[]"} multiple={true}
                   className={"hidden"}
                   accept={addDotPrefixToFileExtensionList(systemSettings.get("accepted_file_mimes"))}
                   maxLength={systemSettings.get("maximum_file_size")}
                   onChange={onFileInputChange} ref={fileInputRef} disabled={sendingMessage}/>

        </>}

        <button type={"submit"} disabled={sendingMessage} className={cn(
            "relative hover:bg-primary/10 cursor-pointer w-[50px] h-[50px]",
            "flex items-center justify-center rounded-md me-2"
        )}>
            {sendingMessage ? <Loader className={"animate-spin"}/> :
                <SendIcon fill={"var(--primary)"}/>}
        </button>


    </form>
}