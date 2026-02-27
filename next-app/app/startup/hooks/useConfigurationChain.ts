import {useMemo, useState} from "react";
import useEnvConfigHandler from "@/app/startup/hooks/useEnvConfigHandler";
import useDbInitiatorHandler from "@/app/startup/hooks/useDbInitiatorHandler";
import useConfigCheckHandler from "@/app/startup/hooks/useConfigCheckHandler";

export default function useConfigurationChain(...params: Parameters<typeof useEnvConfigHandler>) {

    const {handleEnvConfiguration, configuringEnv, envConfigurationError} = useEnvConfigHandler(params[0]);

    const {handleConfigCheck, checkingConfig, configCheckingError} = useConfigCheckHandler();

    const {handleDbInitiation, initiatingDb, dbInitiationError} = useDbInitiatorHandler();

    const [step, setStep] = useState<undefined | "1" | "2" | "3">(undefined);
    const [hasError, setHasError] = useState(false);

    const loading = useMemo(() => {
        return (configuringEnv || checkingConfig || initiatingDb) ?? false;
    }, [checkingConfig, configuringEnv, initiatingDb])

    const errorText = useMemo(() => {
        return (envConfigurationError || configCheckingError || dbInitiationError) ?? null;
    }, [configCheckingError, dbInitiationError, envConfigurationError])

    const handleError = () => {
        setHasError(true);
        setStep(undefined);
    }

    const handleConfigurationChain = () => {
        return new Promise<boolean>(async (resolve) => {

            setHasError(false);

            setStep("1");
            const configuredSuccessfully = await handleEnvConfiguration();
            if (!configuredSuccessfully) {
                handleError()
                resolve(false);
                return;
            }

            await sleep(100);

            setStep("2");
            const checkedSuccessfully = await handleConfigCheck();
            if (!checkedSuccessfully) {
                handleError()
                resolve(false);
                return;
            }

            await sleep(100);

            setStep("3");
            const dbInitiatedSuccessfully = await handleDbInitiation();
            if (!dbInitiatedSuccessfully) {
                handleError()
                resolve(false);
                return;
            }

            setStep(undefined);
            resolve(true);

        });
    }

    return {
        loading, hasError, step, errorText, handleConfigurationChain
    }

}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
