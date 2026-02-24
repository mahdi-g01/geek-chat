'use client'

import React, {useCallback, useEffect, useState} from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import SelfCenteredLoaderIcon from "@/global/components/SelfCenteredLoaderIcon";
import SelfCenteredErrorIcon from "@/global/components/SelfCenteredErrorIcon";
import {ResponseError} from "@/rest/RestMethod";
import {UserPrivate} from "@/rest/types/User";
import GetUser from "@/rest/methods/admin/GetUser";
import UpdateUser, {UpdateUserInput} from "@/rest/methods/admin/UpdateUser";
import BanUser from "@/rest/methods/admin/BanUser";
import UnbanUser from "@/rest/methods/admin/UnbanUser";
import DeleteUser from "@/rest/methods/admin/DeleteUser";
import {useRouter, useSearchParams} from "next/navigation";
import {LabeledInput} from "@/global/components/ui/input";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import AvatarImage from "@/global/components/AvatarImage";
import {Button} from "@/global/components/ui/button";
import {Ban, LoaderIcon, TrashIcon} from "lucide-react";

export default function Page() {

    const {_t, _d} = useLocalization();
    const rest = useRestMethod();
    const router = useRouter();
    const params = useSearchParams();

    const [loadings, setLoadings] = useState({
        userInfo: false,
        banning: false,
        deleting: false,
        saving: false,
    });

    const [loadingError, setLoadingError] = useState<string | undefined>(undefined);
    const [user, setUser] = useState<UserPrivate | undefined>(undefined);

    const [formPublicName, setFormPublicName] = useState("");
    const [formUserName, setFormUserName] = useState("");
    const [formBioText, setFormBioText] = useState("");
    const [formNewPassword, setFormNewPassword] = useState("");

    const userId = params.get("user_id");

    const setLoading = useCallback((key: keyof typeof loadings, val: boolean) => {
        if (val)
            setLoadingError(undefined);
        setLoadings(prev => ({
            ...prev,
            [key]: val
        }));
    }, []);

    useEffect(() => {
        if (!user) return;
        setFormPublicName(user.public_name ?? "");
        setFormUserName(user.user_name ?? "");
        setFormBioText(user.bio_text ?? "");
        setFormNewPassword("");
    }, [user]);

    useEffectAfterApiReady(() => {
        if (userId == null) return;

        setLoading("userInfo", true);
        rest.execute(GetUser, {user_id: userId})
            .then((res) => setUser(res.user))
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setLoading("userInfo", false));
    }, [userId]);

    const handleSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !user) return;

        const payload: UpdateUserInput = {
            user_id: userId,
            public_name: formPublicName || null,
            user_name: formUserName || null,
            bio_text: formBioText || null,
        };
        if (formNewPassword.trim()) payload.password = formNewPassword.trim();

        setLoading("saving", true);
        rest.execute(UpdateUser, payload)
            .then((res) => {
                setUser(res.user);
            })
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setLoading("saving", false));
    }, [userId, user, formPublicName, formUserName, formBioText, formNewPassword, rest, setLoading]);

    const handleBanUnban = useCallback(() => {
        if (!userId) return;

        setLoading("banning", true);
        const method = user?.is_banned ? UnbanUser : BanUser;
        rest.execute(method, {user_id: userId})
            .then((res) => setUser(res.user))
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setLoading("banning", false));
    }, [userId, user?.is_banned, rest, setLoading]);

    const handleDelete = useCallback(() => {
        if (!userId) return;
        if (!window.confirm(_t("confirm_delete_user"))) return;

        setLoading("deleting", true);
        rest.execute(DeleteUser, {user_id: userId})
            .then(() => router.push("/admin/users"))
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setLoading("deleting", false));
    }, [userId, rest, setLoading, router, _t]);

    const anyActionLoading = loadings.banning || loadings.deleting || loadings.saving;

    return (
        <div className={"w-full h-full overflow-y-auto"}>

            {userId == null && !user && (
                <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                    <p>{_t("missing_user_id")}</p>
                </div>
            )}

            <SelfCenteredLoaderIcon loading={loadings.userInfo}/>

            <SelfCenteredErrorIcon show={loadingError != null}/>

            {user && <>
                <div className={"bg-background w-full flex flex-row items-center gap-5 p-5 flex-wrap"}>

                    <AvatarImage user={user}/>

                    <div className={"grow min-w-0"}>
                        <h3 className={"line-clamp-1"}>
                            {user.public_name}
                            {user.is_banned && <span className="text-destructive"> ({_t("is_banned")})</span>}
                        </h3>
                        <p className={"text-sm text-muted-foreground"}>{_t("member_since")}: {_d(user.created_at)}</p>
                    </div>

                    <div className={"flex flex-row gap-2"}>

                        <Button
                            size={"icon"}
                            variant={user.is_banned ? "secondary" : "default"}
                            onClick={handleBanUnban}
                            disabled={anyActionLoading}
                            title={user.is_banned ? _t("unban") : _t("ban")}>
                            {loadings.banning ? <LoaderIcon className={"animate-spin"}/> : <Ban/>}
                        </Button>

                        <Button
                            size={"icon"}
                            variant={"destructive"}
                            onClick={handleDelete}
                            disabled={anyActionLoading}
                            title={_t("delete_user")}>
                            {loadings.deleting ? <LoaderIcon className={"animate-spin"}/> : <TrashIcon/>}
                        </Button>

                    </div>

                </div>

                {loadingError && (
                    <div className={"bg-destructive text-white text-xs text-center py-0.5"}>
                        <p>{loadingError}</p>
                    </div>
                )}

                <form onSubmit={handleSave} className={"grid grid-cols-1 lg:grid-cols-2 gap-5 p-5"}>

                    <LabeledInput
                        label={_t("public_name")}
                        value={formPublicName}
                        onChange={(e) => setFormPublicName(e.target.value)}
                    />

                    <LabeledInput
                        label={_t("user_name")}
                        value={formUserName}
                        onChange={(e) => setFormUserName(e.target.value)}
                    />

                    <LabeledInput
                        label={_t("bio_text")}
                        value={formBioText}
                        onChange={(e) => setFormBioText(e.target.value)}
                    />

                    <LabeledInput
                        label={_t("new_password")}
                        type="password"
                        value={formNewPassword}
                        onChange={(e) => setFormNewPassword(e.target.value)}
                        placeholder={_t("new_password_placeholder")}
                    />

                    <Button type="submit" disabled={anyActionLoading}>
                        {loadings.saving ? <LoaderIcon className={"animate-spin"}/> : _t("save")}
                    </Button>

                </form>

                <div className={"p-5"}/>
            </>}

        </div>
    );
}
