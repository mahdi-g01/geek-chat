'use client'

import React, {useCallback, useState} from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useRouter, useSearchParams} from "next/navigation";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import GetChat from "@/rest/methods/admin/GetChat";
import {UserPublic} from "@/rest/types/User";
import {ResponseError} from "@/rest/RestMethod";
import {Chat} from "@/rest/types/Chat";
import DeleteChat from "@/rest/methods/admin/DeleteChat";
import SelfCenteredLoaderIcon from "@/global/components/SelfCenteredLoaderIcon";
import SelfCenteredErrorIcon from "@/global/components/SelfCenteredErrorIcon";
import AvatarImage from "@/global/components/AvatarImage";
import {Button} from "@/global/components/ui/button";
import {LoaderIcon, TrashIcon} from "lucide-react";
import {UserChip} from "@/global/components/UserChip";
import {kbToMegabyte} from "@/lib/utils";

export default function Page() {
    const {_t, _d} = useLocalization();
    const rest = useRestMethod();
    const router = useRouter();
    const params = useSearchParams();

    const [loadings, setLoadings] = useState({
        chatInfo: false,
        deleting: false,
    });

    const [loadingError, setLoadingError] = useState<string | undefined>(undefined);
    const [chat, setChat] = useState<Chat | undefined>(undefined);
    const [users, setUsers] = useState<UserPublic[] | undefined>(undefined);
    const [filesInfo, setFilesInfo] = useState<{ count: number, size: number } | undefined>(undefined);

    const chatId = params.get("chat_id");

    const setLoading = useCallback((key: keyof typeof loadings, val: boolean) => {
        if (val)
            setLoadingError(undefined);
        setLoadings(prev => ({
            ...prev,
            [key]: val
        }));
    }, []);

    useEffectAfterApiReady(() => {
        if (chatId == null) return;

        setLoading("chatInfo", true);
        rest.execute(GetChat, {chat_id: chatId})
            .then((res) => {
                setChat(res.chat_model);
                setUsers(res.users);
                setFilesInfo({
                    count: res.files_count,
                    size: res.files_size
                })
            })
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setLoading("chatInfo", false));
    }, [chatId]);

    const handleDelete = useCallback(() => {
        if (!chatId) return;
        if (!window.confirm(_t("confirm_delete_chat"))) return;

        setLoading("deleting", true);
        rest.execute(DeleteChat, {chat_id: chatId})
            .then(() => {
                router.replace("/admin/chats")
            })
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setLoading("deleting", false));
    }, [chatId, rest, router, setLoading, _t]);

    const anyActionLoading = loadings.chatInfo || loadings.deleting;

    const chatTypeLabel = (chatType: Chat["chat_type"]) => {
        switch (chatType) {
            case "dialog":
                return _t("chat_type_dialog");
            case "group":
                return _t("chat_type_group");
            case "encrypted_dialog":
                return _t("chat_type_encrypted_dialog");
            default:
                return chatType;
        }
    };

    return (
        <div className={"w-full h-full overflow-y-auto"}>

            {chatId == null && !chat && (
                <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                    <p>{_t("missing_chat_id")}</p>
                </div>
            )}

            <SelfCenteredLoaderIcon loading={loadings.chatInfo}/>

            <SelfCenteredErrorIcon show={loadingError != null}/>

            {chat && filesInfo && <>
                <div className={"bg-background w-full flex flex-row items-center gap-5 p-5 flex-wrap"}>

                    {/*<AvatarImage chat={chat}/>*/}

                    <div className={"grow min-w-0"}>
                        <h3 className={"line-clamp-1"}>
                            {chat.title} ({chatTypeLabel(chat.chat_type)})
                        </h3>
                        <p className={"text-sm text-muted-foreground"}>{_t("created_at")}: {_d(chat.created_at)}</p>
                        {chat.description != null && chat.description !== "" && (
                            <p className={"text-sm text-muted-foreground"}>{_t("chat_description")}: {chat.description}</p>
                        )}
                        <p className={"text-sm text-muted-foreground"}>
                            {filesInfo.count} {_t("file")} ({kbToMegabyte(filesInfo.size)} Mb)
                        </p>
                    </div>

                    <div className={"flex flex-row gap-2"}>

                        <Button
                            size={"icon"}
                            variant={"destructive"}
                            onClick={handleDelete}
                            disabled={anyActionLoading}
                            title={_t("delete_chat")}>
                            {loadings.deleting ? <LoaderIcon className={"animate-spin"}/> : <TrashIcon/>}
                        </Button>

                    </div>

                </div>

                {loadingError && (
                    <div className={"bg-destructive text-white text-xs text-center py-0.5"}>
                        <p>{loadingError}</p>
                    </div>
                )}

                {(users && users.length != 0) && <div className={"flex flex-col gap-3 p-5"}>

                    <h4>{_t("chat_users")}</h4>

                    <div className={"w-full grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3"}>

                        {users.map((user) => {

                            return <UserChip key={user.id} user={user}/>

                        })}

                    </div>

                </div>}


            </>}

        </div>
    );
}
