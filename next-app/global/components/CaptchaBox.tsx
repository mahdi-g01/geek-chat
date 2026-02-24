import {Input} from "@/global/components/ui/input";
import {InfoIcon, Loader, RefreshCw} from "lucide-react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {Button} from "@/global/components/ui/button";

export default function CaptchaBox(
    {
        captchaAnswer,
        setCaptchaAnswer,
        captchaUrl,
        loading,
        loadingError,
        reloadCaptcha
    }: {
        captchaUrl: string | undefined,
        loading: boolean,
        loadingError: boolean,
        captchaAnswer: string,
        setCaptchaAnswer: (val: string) => void,
        reloadCaptcha: () => void,
    }) {

    const {_t} = useLocalization();

    return <div className={"flex flex-col gap-4"}>

        {captchaUrl ?
            <img alt={"captcha"} width={300} src={captchaUrl} className={"rounded-lg"}/> :
            <div className={"w-[300px] h-[80px] rounded-lg flex justify-center items-center"}>
                {loadingError ? <InfoIcon color={"var(--destructive)"}/> :
                    <div className={"w-full h-full animate-pulse bg-neutral-50 opacity-50"}/>}
            </div>
        }

        <div className={"flex items-center gap-4"}>
            <Input placeholder={_t("enter_captcha")}
                   disabled={loading}
                   value={captchaAnswer}
                   onChange={e => setCaptchaAnswer(e.target.value)}/>
            <Button disabled={loading} onClick={reloadCaptcha}>
                {loading ?
                    <Loader color={"white"} className={"animate-spin"} size={16}/> :
                    <RefreshCw/>
                }
            </Button>
        </div>

    </div>

}