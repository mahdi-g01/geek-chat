'use client'

import React, {useCallback, useMemo, useState} from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import SelfCenteredLoaderIcon from "@/global/components/SelfCenteredLoaderIcon";
import SelfCenteredErrorIcon from "@/global/components/SelfCenteredErrorIcon";
import {ResponseError} from "@/rest/RestMethod";
import {UserPrivate} from "@/rest/types/User";
import {PaginationMeta} from "@/rest/types/Pagination";
import GetAllUsers from "@/rest/methods/admin/GetAllUsers";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/global/components/ui/table";
import AdminTablePagination from "@/global/components/AdminTablePagination";
import {CheckIcon, XCircleIcon} from "lucide-react";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import Link from "next/link";

export default function Page() {

    const {_t, _d} = useLocalization();
    const rest = useRestMethod();

    const [loadingUser, setLoadingUser] = useState<boolean>(false);
    const [loadingError, setLoadingError] = useState<string | undefined>(undefined);
    const [users, setUsers] = useState<UserPrivate[] | undefined>(undefined);
    const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(25);

    const totalPages = useMemo(() => {
        if (!pagination) return 0;
        return Math.ceil(pagination?.total / pagination?.per_page)
    }, [pagination]);

    const handleNextPage = useCallback(() => {
        setPage(prev => Math.min(totalPages, prev + 1))
    }, [totalPages])

    const handlePreviousPage = useCallback(() => {
        setPage(prev => Math.max(1, prev - 1))
    }, [])

    useEffectAfterApiReady(() => {
        setLoadingUser(true);
        setLoadingError(undefined);
        rest.execute(GetAllUsers, {
            page, per_page: perPage
        })
            .then((res) => {
                setUsers(res.items);
                setPagination(res.pagination);
            })
            .catch((err: ResponseError) => {
                setLoadingError(err.message);
            })
            .finally(() => {
                setLoadingUser(false);
            });
    }, [page, perPage]);

    return (
        <div className={"w-full h-full overflow-y-auto pb-5"}>

            <SelfCenteredLoaderIcon loading={loadingUser}/>

            <SelfCenteredErrorIcon show={loadingError != null}/>

            <Table>

                <TableHeader>
                    <TableRow>
                        <TableHead>{_t("id")}</TableHead>
                        <TableHead>{_t("user_name")}</TableHead>
                        <TableHead>{_t("public_name")}</TableHead>
                        <TableHead>{_t("is_admin")}</TableHead>
                        <TableHead>{_t("is_banned")}</TableHead>
                        <TableHead className={"text-end"}>{_t("last_seen")}</TableHead>
                        <TableHead/>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {!loadingUser && users?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                {_t("no_users_in_list")}
                            </TableCell>
                        </TableRow>
                    )}
                    {users?.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.user_name}</TableCell>
                            <TableCell>{user.public_name}</TableCell>
                            <TableCell>{user.is_admin ? <CheckIcon/> : <XCircleIcon/>}</TableCell>
                            <TableCell>{user.is_banned ? <CheckIcon/> : <XCircleIcon/>}</TableCell>
                            <TableCell
                                className="text-end">{user.last_seen_at && _d(user.last_seen_at, true)}</TableCell>
                            <TableCell className="text-end">
                                <Link href={`/admin/users/details?user_id=${user.id}`}
                                      className="text-primary hover:underline">
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
                selectId="select-rows-per-page-users"
            />
        </div>
    );
}
