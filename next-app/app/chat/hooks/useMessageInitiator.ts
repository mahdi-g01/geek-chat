import {useEffect, useState} from "react";
import {Chat} from "@/rest/types/Chat";

export default function useMessageInitiator(
    {loader, messagesSetter}: {
        loader: () => Promise<Chat["messages"]>,
        messagesSetter: (messages: Chat["messages"]) => void
    }
) {

    const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);

    useEffect(() => {
        setInitialMessagesLoaded(false);
        messagesSetter([]);
        // Initial load
        loader().then((messages) => {
            messagesSetter(messages);
        }).finally(() => {
            setInitialMessagesLoaded(true);
        });
    }, [loader, messagesSetter]);

    return {
        initialMessagesLoaded,
    }

}