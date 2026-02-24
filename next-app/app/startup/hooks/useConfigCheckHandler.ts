import {ResponseError} from "@/rest/RestMethod";
import {useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import CheckEnv from "@/rest/methods/startup/CheckEnv";

export default function useConfigCheckHandler() {

    const rest = useRestMethod();

    const [checkingConfig, setCheckingConfig] = useState(false);
    const [configCheckingError, setConfigCheckingError] = useState<string | null>();

    const handleConfigCheck = () => {

        return new Promise<boolean>((resolve) => {

            setCheckingConfig(true);
            setConfigCheckingError(undefined);

            rest.execute(CheckEnv)
                .then(() => {
                    resolve(true);
                })
                .catch((err: ResponseError) => {
                    setConfigCheckingError(err.message);
                    resolve(false);
                })
                .finally(() => {
                    setCheckingConfig(false);
                })
        })
    }

    return {
        checkingConfig, configCheckingError, handleConfigCheck
    }

}