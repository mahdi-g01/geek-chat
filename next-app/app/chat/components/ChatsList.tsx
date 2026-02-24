import React, {useState} from "react";
import {cn} from "@/lib/utils";
import {Input} from "@/global/components/ui/input";
import {useLiveChatList} from "@/global/contexts/ChatListContext";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useUser} from "@/global/contexts/UserContext";
import AvatarImage from "@/global/components/AvatarImage";
import useSearchMode from "@/app/chat/hooks/useSearchMode";
import {UserPublic} from "@/rest/types/User";
import {LoaderIcon} from "lucide-react";
import useDialogMaker from "@/app/chat/hooks/useDialogMaker";
import {ResponseError} from "@/rest/RestMethod";
import {Popover, PopoverContent, PopoverTrigger} from "@/global/components/ui/popover";
import Link from "next/link";
import {useRouter} from "next/navigation";


export default function ChatsList() {

    const [searchQuery, setSearchQuery] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);

    const {_t} = useLocalization();
    const {chats, openChat, openedChat, initialLoading} = useLiveChatList();
    const {user, logoutUser} = useUser();
    const router = useRouter();

    const {resultUsers, searching, searchModeIsActive} = useSearchMode({query: searchQuery});

    const handleLogOut = () => {
        setLoggingOut(true);
        logoutUser()
            .then(() => router.replace("/"))
            .finally(() => setLoggingOut(false))
    }

    return <>

        <div className={cn(
            "w-full p-5 sticky flex items-center gap-4 top-0",
            "bg-linear-to-b from-card from-80% to-card/0 "
        )}>

            <Popover>

                <PopoverTrigger asChild>
                    <div className={"cursor-pointer hover:brightness-110"}>
                        <AvatarImage user={user} size={40}/>
                    </div>
                </PopoverTrigger>

                <PopoverContent className={"flex flex-col p-0 divide-y divide-border"}>
                    {[
                        {link: "/profile", title: _t("page_title_profile")},
                        user?.is_admin ? {link: "/admin", title: _t("page_title_admin")} : undefined,
                    ].map((item, index) => {
                        if (item == undefined)
                            return <></>
                        return <Link key={index} href={item.link}
                                     className={"px-5 py-3 hover:bg-foreground/5 cursor-pointer w-full"}>
                            {item.title}
                        </Link>
                    })}
                    <Link href={"#"} onClick={handleLogOut}
                          className={cn(
                              "px-5 py-3 hover:bg-foreground/5 cursor-pointer w-full",
                              "flex items-center justify-between text-destructive"
                          )}>
                        <span>{_t("logout")}</span>
                        {loggingOut && <LoaderIcon className={"animate-spin"} color={"var(--destructive)"}/>}
                    </Link>
                </PopoverContent>

            </Popover>

            <Input className={"flex-1"} placeholder={`${_t("search_users")}...`}
                   value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
        </div>

        {searchModeIsActive ?

            <SearchList resultUsers={resultUsers} searching={searching} onDialogCreated={() => setSearchQuery("")}/>

            : initialLoading ? <div className={"flex h-full w-full top-0 absolute items-center justify-center"}>
                <LoaderIcon className={"animate-spin"}/>
            </div> : chats.map(chat => {

                const isEncrypted = chat.chat_type == "encrypted_dialog";

                return <div key={chat.id}
                            onClick={() => openChat(chat)}
                            className={cn(
                                "w-full p-5 flex items-center gap-5",
                                openedChat?.id == chat.id ? "bg-card-foreground/10" : "hover:bg-card-foreground/10 cursor-pointer",
                            )}>

                    <AvatarImage chat={chat} size={60}/>

                    <div className={"grow"}>
                        <h6 className={"line-clamp-1"}>{chat.title}</h6>
                        {isEncrypted
                            ? <span className={"px-1 py-0.5 text-xs rounded-sm bg-primary text-white"}>{_t("encrypted")}</span>
                            : <p className={`text-sm text-muted-foreground overflow-hidden line-clamp-1 ${chat.has_unseen_event && "font-bold !text-foreground"}`}>
                                {chat.last_message}
                            </p>}
                    </div>

                    <div>
                        {chat.has_unseen_event && <div className={"bg-primary w-3 h-3 rounded-full"}/>}
                    </div>

                </div>
            })}

    </>
}

function SearchList(
    {resultUsers, searching, onDialogCreated}:
    {
        resultUsers: UserPublic[] | undefined,
        searching: boolean,
        onDialogCreated: () => void
    }
) {

    const {_t} = useLocalization();

    if (searching)
        return <div className={"h-[200px] w-full flex items-center justify-center"}>
            <LoaderIcon className={"animate-spin"}/>
        </div>

    if (resultUsers == undefined)
        return <></>

    if (resultUsers.length == 0)
        return <div className={"h-[200px] w-full flex items-center justify-center"}>
            <p>{_t("no_user_found")}</p>
        </div>

    else return resultUsers.map(user => {

        return <SearchResultItem key={user.id} user={user} onDialogCreated={onDialogCreated}/>

    })

}

function SearchResultItem({user, onDialogCreated}: { user: UserPublic, onDialogCreated: () => void }) {

    const [errorOnDialogMake, setErrorOnDialogMake] = useState<string | undefined>();
    const {_t} = useLocalization();
    const dialogMaker = useDialogMaker();
    const chatList = useLiveChatList();

    const handleClick = () => {
        dialogMaker.make(user.id).then(res => {
            chatList.openChat(res.chat);
            onDialogCreated();
        }).catch((err: ResponseError) => {
            setErrorOnDialogMake(err.message);
        })
    }

    return <div className={cn(
        "w-full p-5 flex items-center gap-5",
        "hover:bg-card-foreground/10 cursor-pointer",
    )} onClick={handleClick}>

        <AvatarImage user={user} size={60}/>

        <div className={"grow"}>
            <h6 className={"line-clamp-1"}>{user.public_name}</h6>
            <p className={`text-sm text-muted-foreground line-clamp-1`}>
                {errorOnDialogMake ?? _t("click_to_dialog")}
            </p>
        </div>

        <div className={"flex h-full items-center justify-center"}>
            {dialogMaker.making && <LoaderIcon className={"animate-spin"}/>}
        </div>

    </div>
}