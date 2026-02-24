import {useCallback, useState} from "react";
import {Chat} from "@/rest/types/Chat";
import ChatMessages from "@/rest/methods/app/ChatMessages";
import {ResponseError} from "@/rest/RestMethod";
import {useRestMethod} from "@/global/contexts/RestApiContext";

export default function useMessageLoader(
    {chatId}: {
        chatId: number | string | undefined
    }
) {

    const rest = useRestMethod();
    const [loadingMessages, setLoadingMessages] = useState(false);

    const loader = useCallback((fromTs: string | undefined = undefined, untilTs: string | undefined = undefined, limit: number | "unlimited" = 20) => {
        return new Promise<Chat["messages"]>((resolve, reject) => {
            setLoadingMessages(true);
            rest.execute(ChatMessages, {
                chat_id: `${chatId}`,
                load_from_ts: fromTs,
                load_until_ts: untilTs,
                limit: limit == "unlimited" ? null : limit
            })
                .then(response => {
                    resolve(response.messages);
                }).catch((error: ResponseError) => {
                reject(error.message);
            }).finally(() => setLoadingMessages(false));
        })
    }, [chatId, rest]);

    return {
        messageLoader: loader,
        loadingMessages
    }

}