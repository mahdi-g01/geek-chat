'use client'
import React, {useCallback, useState} from "react";
import PageResponsiveBoxContainer from "@/global/components/PageResponsiveBoxContainer";
import {cn} from "@/lib/utils";
import {usePathname, useRouter} from "next/navigation";
import {
    ArrowLeft, ArrowRight,
    LayoutDashboardIcon,
    LucideGithub,
    MenuIcon,
    MessageSquareIcon, MessagesSquareIcon,
    SettingsIcon,
    UserPlusIcon,
    UsersIcon
} from "lucide-react";
import Logo from "@/assets/GeekChat-Logo.svg"
import Image from "next/image";
import Link from "next/link";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {Button} from "@/global/components/ui/button";
import {useUser} from "@/global/contexts/UserContext";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import {PageNotFoundError} from "next/dist/shared/lib/utils";

export default function Layout(
    {
        children
    }: Readonly<{
        children: React.ReactNode
    }>) {

    const router = useRouter();
    const {_d, _t} = useLocalization();

    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const toggleMenu = useCallback(() => {
        setMenuIsOpen(prev => !prev)
    }, []);
    const {user} = useUser();

    useEffectAfterApiReady(()=>{
        if (user && !user?.is_admin)
            router.replace("/")
    }, [user]);

    const pages: {
        link: string,
        titleKey: string,
        activeCheckType: "full-path" | "prefix-check",
        icon: React.ReactNode
    }[] = [
        {
            link: "/admin/",
            activeCheckType: "full-path",
            titleKey: "admin_sidebar_dashboard",
            icon: <LayoutDashboardIcon size={20} color={"white"}/>
        },
        {
            link: "/admin/new-user/",
            activeCheckType: "full-path",
            titleKey: "new_user",
            icon: <UserPlusIcon size={20} color={"white"}/>
        },
        {
            link: "/admin/users/",
            activeCheckType: "prefix-check",
            titleKey: "admin_sidebar_users",
            icon: <UsersIcon size={20} color={"white"}/>
        },
        {
            link: "/admin/chats/",
            activeCheckType: "prefix-check",
            titleKey: "admin_sidebar_chats",
            icon: <MessageSquareIcon size={20} color={"white"}/>
        },
        {
            link: "/admin/setting/",
            activeCheckType: "prefix-check",
            titleKey: "admin_sidebar_settings",
            icon: <SettingsIcon size={20} color={"white"}/>
        },
    ]

    const path = usePathname();

    if (!user?.is_admin)
        return <></>

    return (

        <PageResponsiveBoxContainer>

            <div className={cn(
                "bg-card z-20 h-full",
                "border-e border-border overflow-y-auto transition-all",
                "absolute lg:relative lg:flex-1/4",
                menuIsOpen ? "start-0" : "-start-full",
                "lg:start-0"
            )}>

                <div className={cn(
                    "w-full p-5 sticky flex items-center gap-4 top-0",
                    "bg-black from-card from-80% to-card/0 "
                )} style={{direction: "rtl"}}>

                    <div className={"lg:hidden bg-white p-2 rounded-md cursor-pointer"} onClick={toggleMenu}>
                        <MenuIcon/>
                    </div>

                    <Image width={60} height={60} src={Logo} alt={"GeekChat Logo"}/>

                    <div className={"text-white text-left grow"}>
                        <h2><strong>Geek</strong>Chat</h2>
                        <p className={"text-xs font-thin"}>
                            Powered by <a target={"_blank"} href={"https://geekop.ir"}>GeekOp
                        </a></p>
                    </div>

                </div>

                {pages.map((item, index) => {
                    let active: boolean;
                    if (item.activeCheckType === "full-path") {
                        active = path === item.link;
                    } else {
                        active = path === item.link || path.startsWith(item.link);
                    }

                    return <div key={index} className={cn(
                        "w-full p-5 flex items-center gap-5",
                        active ? "bg-card-foreground/10" : "hover:bg-card-foreground/10 cursor-pointer",
                    )} onClick={() => {
                        setMenuIsOpen(false)
                        router.push(item.link)
                    }}>

                        <div className={"w-[60px] h-[60px] rounded-full bg-primary flex items-center justify-center"}>
                            {item.icon}
                        </div>

                        <div className={"grow"}>
                            <h6 className={"line-clamp-1"}>{_t(item.titleKey)}</h6>
                        </div>

                    </div>
                })}

            </div>

            <div className={cn(
                "h-full flex flex-col pb-[117px] w-full",
                "block relative flex-1 md:flex-3/4"
            )}>

                <div className={"w-full flex p-5 border-b justify-between"}>
                    <div>
                        <Button className={"lg:hidden"} onClick={toggleMenu}>
                            {_t("admin_menu")}
                            <MenuIcon/>
                        </Button>
                    </div>
                    <Button variant={"secondary"} onClick={()=>router.replace("/chat")}>
                        {_t("back_to_app")}
                        <MessagesSquareIcon />
                    </Button>
                </div>

                {children}

                <div className={cn(
                    "flex absolute left-0 bottom-0 w-full p-2 justify-between",
                    "border-t border-border text-muted-foreground text-sm",
                    "bg-card",
                )}>
                    <span>{_d(new Date())}</span>
                    <Link href={process.env.NEXT_PUBLIC_GITHUB_URL ?? "#"} className={"flex items-center gap-2"}>
                        <span>GeekChat {process.env.NEXT_PUBLIC_VERSION}</span>
                        <LucideGithub fill={"var(--muted-foreground)"} color={"var(--muted-foreground)"}/>
                    </Link>
                </div>

            </div>

        </PageResponsiveBoxContainer>
    );

}
