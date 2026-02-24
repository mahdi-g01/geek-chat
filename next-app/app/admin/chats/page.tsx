'use client'

import React, {useCallback, useMemo, useState} from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import SelfCenteredLoaderIcon from "@/global/components/SelfCenteredLoaderIcon";
import SelfCenteredErrorIcon from "@/global/components/SelfCenteredErrorIcon";
import {ResponseError} from "@/rest/RestMethod";
import {Chat} from "@/rest/types/Chat";
import {PaginationMeta} from "@/rest/types/Pagination";
import GetAllChats from "@/rest/methods/admin/GetAllChats";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/global/components/ui/table";
import AdminTablePagination from "@/global/components/AdminTablePagination";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import Link from "next/link";

export default function Page() {

    const {_t, _d} = useLocalization();
    const rest = useRestMethod();

    const [loadingChats, setLoadingChats] = useState<boolean>(false);
    const [loadingError, setLoadingError] = useState<string | undefined>(undefined);
    const [chats, setChats] = useState<Chat[] | undefined>(undefined);
    const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(25);

    const totalPages = useMemo(() => {
        if (!pagination) return 0;
        return pagination.last_page ?? Math.ceil(pagination.total / pagination.per_page);
    }, [pagination]);

    const handleNextPage = useCallback(() => {
        setPage(prev => Math.min(totalPages, prev + 1));
    }, [totalPages]);

    const handlePreviousPage = useCallback(() => {
        setPage(prev => Math.max(1, prev - 1));
    }, []);
    
    useEffectAfterApiReady(() => {
        setLoadingChats(true);
        setLoadingError(undefined);
        rest.execute(GetAllChats, { page, per_page: perPage })
            .then((res) => {
                setChats(res.items);
                setPagination(res.pagination);
            })
            .catch((err: ResponseError) => {
                setLoadingError(err.message);
            })
            .finally(() => {
                setLoadingChats(false);
            });
    }, [page, perPage]);

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
        <div className={"w-full h-full overflow-y-auto pb-5"}>

            <SelfCenteredLoaderIcon loading={loadingChats}/>

            <SelfCenteredErrorIcon show={loadingError != null}/>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{_t("id")}</TableHead>
                        <TableHead>{_t("chat_title")}</TableHead>
                        <TableHead>{_t("chat_type")}</TableHead>
                        <TableHead>{_t("created_at")}</TableHead>
                        <TableHead className={"text-end"}>{_t("updated_at")}</TableHead>
                        <TableHead/>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {!loadingChats && chats?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                {_t("no_chats_in_list")}
                            </TableCell>
                        </TableRow>
                    )}
                    {chats?.map((chat) => (
                        <TableRow key={chat.id}>
                            <TableCell className="font-medium">{chat.id}</TableCell>
                            <TableCell className="max-w-[200px] line-clamp-1 truncate" title={chat.title ?? undefined}>
                                {chat?.title ?? "--"}
                            </TableCell>
                            <TableCell>{chatTypeLabel(chat.chat_type)}</TableCell>
                            <TableCell>{chat.created_at && _d(chat.created_at)}</TableCell>
                            <TableCell className="text-end">{chat.updated_at && _d(chat.updated_at, true)}</TableCell>
                            <TableCell className="text-end">
                                <Link
                                    href={`/admin/chats/details?chat_id=${chat.id}`}
                                    className="text-primary hover:underline" >
                                    {_t("view")}
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <AdminTablePagination
                page={page}
                totalPages={totalPages}
                perPage={perPage}
                onPerPageChange={setPerPage}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
                total={pagination?.total}
                selectId="select-rows-per-page-chats"
            />
        </div>
    );
}
