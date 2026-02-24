'use client';

import React from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/global/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/global/components/ui/select";

const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

export type AdminTablePaginationProps = {
    page: number;
    totalPages: number;
    perPage: number;
    onPerPageChange: (value: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
    total?: number;
    selectId?: string;
};

export default function AdminTablePagination({
    page,
    totalPages,
    perPage,
    onPerPageChange,
    onPreviousPage,
    onNextPage,
    total,
    selectId = "select-rows-per-page",
}: AdminTablePaginationProps) {
    const {_t} = useLocalization();

    return (
        <div className="flex flex-col md:flex-row items-center justify-center mt-4 gap-4">
            <div className={"flex items-center gap-2"}>
                <span className={"text-sm text-muted-foreground"}>{_t("per_page")}:</span>
                <Select value={`${perPage}`} onValueChange={(e) => onPerPageChange(Number(e))}>
                    <SelectTrigger className="w-20" id={selectId}>
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent align="start">
                        <SelectGroup>
                            {PER_PAGE_OPTIONS.map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <Pagination className="mx-0 w-auto">
                <PaginationContent>
                    <PaginationItem onClick={onPreviousPage}>
                        <PaginationPrevious text={_t("previous_page")} href="#"/>
                    </PaginationItem>
                    <PaginationItem className={"text-xs border p-2 rounded-sm"}>
                        {totalPages > 0 ? _t("page_of", page, totalPages) : page}
                    </PaginationItem>
                    <PaginationItem onClick={onNextPage}>
                        <PaginationNext text={_t("next_page")} href="#"/>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            <span className={"text-sm text-muted-foreground"}>{_t("total_pages")}: {totalPages}</span>
            {total != null && (
                <span className={"text-sm text-muted-foreground"}>
                    ({_t("total")}: {total})
                </span>
            )}
        </div>
    );
}
