'use client'

import React, {useCallback, useState} from "react";
import {useRestApi, useRestMethod} from "@/global/contexts/RestApiContext";
import {Loader} from "lucide-react";
import AuthLogin from "@/rest/methods/auth/AuthLogin";
import {setPreference} from "@/global/functions/capacitor_preferences";
import {Input} from "@/global/components/ui/input";
import {Button} from "@/global/components/ui/button";
import useCaptcha from "@/global/hooks/useCaptcha";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {useRouter} from "next/navigation";
import CaptchaBox from "@/global/components/CaptchaBox";
import {ResponseError} from "@/rest/RestMethod";
import useSystemSettings from "@/global/contexts/SystemSettingsContext";
import useEffectAfterApiReady from "@/global/hooks/useEffectAfterApiReady";
import {useUser} from "@/global/contexts/UserContext";
import Logo from "@/assets/GeekChat-Logo.svg";
import Image from "next/image";

export default function Page() {

    const {setApiToken} = useRestApi();
    const systemSettings = useSystemSettings();
    const rest = useRestMethod();
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<undefined | string>();

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
        rest.execute(AuthLogin, {
            user_name: userName,
            password: password,
            ...responseBatch
        }).then((res) => {
            setPreference("api_token", res.token).then(() => {
                router.replace("/chat");
                setApiToken(res.token);
            })
        }).catch((e: ResponseError) => {
            setError(e.message)
        }).finally(() => {
            setLoading(false)
        })
    }, [password, responseBatch, rest, router, setApiToken, userName])

    const signup = () => {
        router.push("/signup");
    }

    return <>
        <div className={"flex flex-row justify-center w-full h-full gap-4 p-5"}>

            <div className={"flex flex-col h-full min-w-[300px] justify-center gap-4"}>

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
                    {loading ? <Loader color={"white"} className={"animate-spin"} size={16}/> : _t("enter")}
                </Button>

                {systemSettings.get("allow_user_signup") &&
                    <Button disabled={loading} variant={"ghost"} onClick={signup}>
                        {_t("signup")}
                    </Button>}

                <span className={"text-destructive/80 text-sm text-center"}>
                    {error ?? ""}
                </span>

            </div>

            <div className={"h-full flex-col justify-center opacity-80 hidden md:flex"}>
                <img src={"https://doodleipsum.com/700/abstract"}
                     onError={e=>{
                         (e.target as HTMLImageElement).onerror = null;
                         (e.target as HTMLImageElement).src = "/abstract.png";
                     }}
                     alt={"Abstract image"} width={500}/>
            </div>

        </div>
    </>
}
