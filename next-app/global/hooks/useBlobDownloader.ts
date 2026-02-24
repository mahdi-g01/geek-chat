import {useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import DownloadChatFile from "@/rest/methods/app/DownloadChatFile";
import {downloadBlob} from "@/lib/utils";

export default function useBlobDownloader(
    params: {
        chat_id: any,
        message_id: any,
        file_id: any,
        file_name: string
    }
) {

    const [fileBlob, setFileBlob] = useState<Blob | null>(null);
    const [fetchingBlob, setFetchingBlob] = useState(false);

    const rest = useRestMethod();

    const fetchBlob = (downloadAfterFetch: boolean = false) => {
        if (!fetchingBlob) {
            setFetchingBlob(true);
            rest.execute(DownloadChatFile, {
                chat_id: params.chat_id,
                file_id: params.file_id,
                message_id: params.message_id
            })
                .then(blob => {
                    setFileBlob(blob)
                    if (downloadAfterFetch)
                        downloadBlob(blob, params.file_name)
                })
                .catch()
                .finally(() => {
                    setFetchingBlob(false)
                })
        }
    }

    return {
        fetch: fetchBlob,
        download: () => {
            if (fileBlob)
                downloadBlob(fileBlob, params.file_name)
            else fetchBlob(true)
        },
        fetchingBlob, fileBlob
    }

}