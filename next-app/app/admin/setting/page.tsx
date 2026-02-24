'use client'

import React, {useCallback, useState} from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import GetSystemSettings from "@/rest/methods/admin/GetSystemSettings";
import SetSystemSettings from "@/rest/methods/admin/SetSystemSettings";
import {LabeledInput} from "@/global/components/ui/input";
import {Switch} from "@/global/components/ui/switch";
import SelfCenteredLoaderIcon from "@/global/components/SelfCenteredLoaderIcon";
import SelfCenteredErrorIcon from "@/global/components/SelfCenteredErrorIcon";
import {Button} from "@/global/components/ui/button";
import {LoaderIcon} from "lucide-react";
import {ResponseError} from "@/rest/RestMethod";

type SettingItem = { key: string; title: string; value: string | boolean | number };

export default function Page() {
    const {_t} = useLocalization();
    const rest = useRestMethod();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingError, setLoadingError] = useState<string | undefined>(undefined);
    const [settings, setSettings] = useState<SettingItem[] | undefined>(undefined);

    const handleChange = useCallback((val: SettingItem["value"], key: string) => {
        setSettings(prev => {
            if (prev == null) return undefined;
            return prev.map(s => s.key !== key ? s : { ...s, value: val });
        });
    }, []);

    useEffectAfterApiReady(() => {
        setLoading(true);
        setLoadingError(undefined);
        rest.execute(GetSystemSettings)
            .then(res => setSettings(res.settings))
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!settings?.length) return;

        const payload: Record<string, string | null> = {};
        for (const s of settings) {
            payload[s.key] = s.value == null ? null : String(s.value);
        }

        setSaving(true);
        setLoadingError(undefined);
        rest.execute(SetSystemSettings, payload)
            .then(() => { /* success; keep current state */ })
            .catch((err: ResponseError) => setLoadingError(err.message))
            .finally(() => setSaving(false));
    }, [settings, rest]);

    return (
        <div className={"w-full h-full overflow-y-auto relative"}>

            <SelfCenteredLoaderIcon loading={loading}/>

            <SelfCenteredErrorIcon show={loadingError != null}/>

            {settings != null && (
                <form onSubmit={handleSave} className={"w-full overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5 p-5"}>

                    <div className={"flex flex-col gap-5"}>
                        {settings.map((setting, index) => {
                            if (typeof setting.value === "string")
                                return (
                                    <LabeledInput
                                        key={setting.key}
                                        onChange={(e) => handleChange(e.target.value, setting.key)}
                                        label={setting.title}
                                        value={setting.value}
                                    />
                                );
                            if (typeof setting.value === "number")
                                return (
                                    <LabeledInput
                                        key={setting.key}
                                        type={"number"}
                                        onChange={(e) => handleChange(e.target.value === "" ? 0 : Number(e.target.value), setting.key)}
                                        label={setting.title}
                                        value={setting.value ?? ""}
                                    />
                                );
                            return null;
                        })}
                    </div>

                    <div className={"flex flex-col gap-5"}>
                        {settings.map((setting) => {
                            if (typeof setting.value !== "boolean") return null;
                            return (
                                <div key={setting.key} className={"flex justify-between items-center bg-background p-2 rounded-md"}>
                                    <label>{setting.title}</label>
                                    <Switch
                                        checked={setting.value}
                                        onCheckedChange={(checked) => handleChange(checked, setting.key)}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className={"md:col-span-2"}>
                        <Button type="submit" disabled={saving}>
                            {saving ? <LoaderIcon className={"animate-spin"} /> : _t("save")}
                        </Button>
                    </div>

                </form>
            )}
        </div>
    );
}
