'use client'

import React, {useCallback, useState} from "react";
import {useRestApi, useRestMethod} from "@/global/contexts/RestApiContext";
import {Loader} from "lucide-react";
import {setPreference} from "@/global/functions/capacitor_preferences";
import {Input} from "@/global/components/ui/input";
import {Button} from "@/global/components/ui/button";
import useCaptcha from "@/global/hooks/useCaptcha";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useRouter} from "next/navigation";
import CaptchaBox from "@/global/components/CaptchaBox";
import Logo from "@/assets/GeekChat-Logo.svg";
import {ResponseError} from "@/rest/RestMethod";
import AuthSignup from "@/rest/methods/auth/AuthSignup";
import useSystemSettings from "@/global/contexts/SystemSettingsContext";
import {useUser} from "@/global/contexts/UserContext";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import Image from "next/image";

export default function Page() {

    const {setApiToken} = useRestApi();
    const systemSettings = useSystemSettings();
    const rest = useRestMethod();
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [publicName, setPublicName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<undefined|string>();

    const {
        reloadCaptcha,
        loading: captchaLoading,
        captchaAnswer,
        loadingError,
        setCaptchaAnswer,
        captchaUrl,
        responseBatch,
    } = useCaptcha();

    const {_t} = useLocalization();

    const {isLoggedIn} = useUser();
    useEffectAfterApiReady(() => {
        isLoggedIn().then(is => {
            if (is) router.replace("/chat");
        });
    }, [isLoggedIn])

    const login = useCallback(() => {
        setLoading(true)
        setError(undefined);
        rest.execute(AuthSignup, {
            user_name: userName,
            password: password,
            public_name: publicName,
            ...responseBatch
        }).then((res) => {
            setPreference("api_token", res.token).then(() => {
                router.replace("/chat");
                setApiToken(res.token)
            })
        }).catch((e: ResponseError) => {
            setError(e.message);
            reloadCaptcha();
        }).finally(() => {
            setLoading(false)
        })
    }, [password, publicName, responseBatch, rest, router, setApiToken, userName])

    return systemSettings.get("allow_user_signup") ? <>
        <div className={"flex flex-row justify-center w-full h-full gap-4 p-5"}>

            <div className={"flex flex-col h-full justify-center gap-4 w-[300px]"}>

                <Image
                    width={80}
                    height={80}
                    src={Logo}
                    alt="GeekChat"
                    className="opacity-90 mx-auto"
                />
                <h1 className={"text-xl text-center text-muted-foreground"}><strong>Geek</strong>Chat</h1>

                <Input placeholder={_t("user_name")} value={userName} className={"text-center"}
                       onChange={e => setUserName(e.target.value)}/>

                <Input placeholder={_t("public_name")} value={publicName} className={"text-center"}
                       onChange={e => setPublicName(e.target.value)}/>

                <Input placeholder={_t("password")} value={password} className={"text-center"}
                       type={"password"}
                       onChange={e => setPassword(e.target.value)}/>

                {systemSettings.get("auth_captcha_activated") && <CaptchaBox
                    captchaUrl={captchaUrl}
                    loading={captchaLoading}
                    loadingError={loadingError}
                    captchaAnswer={captchaAnswer ?? ""}
                    setCaptchaAnswer={setCaptchaAnswer}
                    reloadCaptcha={reloadCaptcha}/>}

                <Button disabled={loading} onClick={login} type={"submit"}>
                    {loading ? <Loader color={"white"} className={"animate-spin"} size={16}/> : _t("signup")}
                </Button>

                <span className={"text-destructive/80 text-sm text-center"}>
                    {error ?? ""}
                </span>

            </div>

            <div className={"h-full flex-col justify-center opacity-80 hidden md:flex"}>
                <img src={"https://doodleipsum.com/700/abstract"} alt={""} width={500}/>
            </div>

        </div>
    </> : <></>
}
