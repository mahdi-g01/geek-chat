'use client'

import {useRestMethod} from "@/global/contexts/RestApiContext";
import {useEffect, useState} from "react";
import Captcha from "@/rest/methods/Captcha";

export default function useCaptcha() {

    const rest = useRestMethod();
    const [reloadedAt, setReloadedAt] = useState<Date | undefined>(undefined);

    const [payload, setPayload] = useState<string | undefined>(undefined);
    const [base64, setBase64] = useState<string | undefined>(undefined);
    const [timestamp, setTimestamp] = useState<string | undefined>(undefined);
    const [answer, setAnswer] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [loadingError, setLoadingError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setBase64(undefined);
        setTimestamp(undefined);
        setAnswer(undefined);
        setPayload(undefined);
        rest.execute(Captcha)
            .then(res => {
                setPayload(res.payload);
                setTimestamp(res.timestamp);
                setBase64(res.base64_url);
            })
            .catch(() => setLoadingError(true))
            .finally(() => setLoading(false))
    }, [reloadedAt]);

    const reloadCaptcha = () => {
        setReloadedAt(new Date(Date.now()))
    }

    return {
        reloadCaptcha,
        loading, loadingError,
        captchaAnswer: answer,
        setCaptchaAnswer: setAnswer,
        captchaUrl: base64,
        responseBatch: {
            captcha_answer: answer,
            captcha_ts: timestamp,
            captcha_payload: payload
        }
    }
}