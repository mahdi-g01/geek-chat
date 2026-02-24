'use client'

import React, {useCallback, useState} from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import {useRouter} from "next/navigation";
import CreateUser from "@/rest/methods/admin/CreateUser";
import {LabeledInput} from "@/global/components/ui/input";
import {Button} from "@/global/components/ui/button";
import SelfCenteredErrorIcon from "@/global/components/SelfCenteredErrorIcon";
import {LoaderIcon} from "lucide-react";
import {ResponseError} from "@/rest/RestMethod";
import Link from "next/link";

export default function Page() {
    const {_t} = useLocalization();
    const rest = useRestMethod();
    const router = useRouter();

    const [saving, setSaving] = useState(false);
    const [loadingError, setLoadingError] = useState<string | undefined>(undefined);

    const [formUserName, setFormUserName] = useState("");
    const [formPublicName, setFormPublicName] = useState("");
    const [formPassword, setFormPassword] = useState("");

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        const user_name = formUserName.trim();
        const password = formPassword.trim();

        if (!user_name || !password) {
            setLoadingError(_t("fill_required_fields"));
            return;
        }
        if (password.length < 8) {
            setLoadingError(_t("password_min_length"));
            return;
        }

        setSaving(true);
        setLoadingError(undefined);
        rest.execute(CreateUser, {
            user_name,
            password,
            public_name: formPublicName.trim() || null,
        })
            .then((res) => {
                router.replace(`/admin/users/details?user_id=${res.user.id}`);
            })
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setSaving(false));
    }, [formUserName, formPublicName, formPassword, rest, router, _t]);

    return (
        <div className="w-full h-full overflow-y-auto relative">
            <SelfCenteredErrorIcon show={loadingError != null} />

            {loadingError && (
                <div className="bg-destructive text-white text-xs text-center py-0.5">
                    <p>{loadingError}</p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5"
            >
                <LabeledInput
                    label={_t("user_name")}
                    value={formUserName}
                    onChange={(e) => setFormUserName(e.target.value)}
                    required
                    autoComplete="username"
                />

                <LabeledInput
                    label={_t("public_name")}
                    value={formPublicName}
                    onChange={(e) => setFormPublicName(e.target.value)}
                    autoComplete="name"
                />

                <LabeledInput
                    label={_t("password")}
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder={_t("password_min_placeholder")}
                    autoComplete="new-password"
                />

                <div className="flex flex-row gap-2 items-center lg:col-span-2">
                    <Button type="submit" disabled={saving}>
                        {saving ? <LoaderIcon className="animate-spin" /> : _t("create_user")}
                    </Button>
                    <Button type="button" variant="secondary" onClick={()=>router.back()}>
                        {_t("cancel")}
                    </Button>
                </div>

            </form>
        </div>
    );
}
