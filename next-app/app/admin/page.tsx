'use client'

import React, {useState} from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {AdminDashboardInfo} from "@/rest/types/AdminDashboardInfo";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import DashboardInfo from "@/rest/methods/admin/DashboardInfo";
import {ResponseError} from "@/rest/RestMethod";
import {cn, kbToMegabyte} from "@/lib/utils";
import {
    FilesIcon,
    GithubIcon,
    LoaderIcon,
    LucideGithub,
    MessageSquareIcon,
    MessagesSquareIcon,
    UsersIcon
} from "lucide-react";
import {UserPublic} from "@/rest/types/User";
import AvatarImage from "@/global/components/AvatarImage";
import SelfCenteredLoaderIcon from "@/global/components/SelfCenteredLoaderIcon";
import SelfCenteredErrorIcon from "@/global/components/SelfCenteredErrorIcon";
import Link from "next/link";
import {UserChip} from "@/global/components/UserChip";

export default function Page() {

    const {_t, _d} = useLocalization();
    const rest = useRestMethod();

    const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
    const [dashboardInfo, setDashboardInfo] = useState<AdminDashboardInfo|undefined>(undefined);
    const [loadingError, setLoadingError] = useState<string|undefined>(undefined);

    useEffectAfterApiReady(()=>{
        setLoadingInfo(true);
        setLoadingError(undefined);
        rest.execute(DashboardInfo)
            .then(res=>{
                setDashboardInfo(res);
            })
            .catch((err: ResponseError) => {
                setLoadingError(err.message);
            })
            .finally(()=>{
                setLoadingInfo(false);
            })
    })

    return (
        <div className={"w-full h-full overflow-y-auto relative"}>

            <SelfCenteredLoaderIcon loading={loadingInfo}/>

            <SelfCenteredErrorIcon show={loadingError != null}/>

            {dashboardInfo && <div className={"w-full grid grid-cols-1 md:grid-cols-2 divide-y divide-x"}>

                <StatisticSection title={_t("dashboard_today_messages")} icon={<MessagesSquareIcon/>}>
                    <strong>{dashboardInfo.today_messages}</strong>
                </StatisticSection>

                <StatisticSection title={_t("dashboard_total_messages")} icon={<MessagesSquareIcon/>}>
                    <strong>{dashboardInfo.total_messages}</strong>
                </StatisticSection>

                <StatisticSection title={_t("dashboard_total_users")} icon={<UsersIcon/>}>
                    <strong>{dashboardInfo.total_users}</strong>
                </StatisticSection>

                <StatisticSection title={_t("dashboard_occupied_space")} icon={<FilesIcon/>}>
                    <div style={{direction: "ltr"}}>
                        <strong>{`${kbToMegabyte(dashboardInfo.occupied_space_kb)} Mb`}</strong>
                        {` / `}
                        <span>{`${kbToMegabyte(dashboardInfo.available_file_space_kb)} Mb`}</span>
                    </div>
                </StatisticSection>

            </div>}

            {(dashboardInfo && dashboardInfo.latest_users.length != 0) && <div className={"flex flex-col gap-3 p-5"}>

                <h4>{_t("latest_users")}</h4>

                <div className={"w-full grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3"}>

                    {dashboardInfo.latest_users.map((user)=>{

                        return <UserChip key={user.id} user={user}/>

                    })}

                </div>

            </div>}

        </div>
    );
}

function StatisticSection({title, icon, className, children, ...props}: React.ComponentProps<"div"> & {icon: React.ReactNode, title: string}){
    return <div className={cn(
        "last:border-b p-5 gap-5",
        "flex",
        className,
    )} {...props}>
        <div>
            {icon}
        </div>
        <div className={"flex flex-col gap-2"}>
            <h3 className={"text-md font-bold text-muted-foreground"}>{title}</h3>
            <div className={"text-lg"}>{children}</div>
        </div>
    </div>
}
