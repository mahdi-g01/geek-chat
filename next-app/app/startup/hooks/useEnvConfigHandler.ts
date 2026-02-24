import ConfigEnv from "@/rest/methods/startup/ConfigEnv";
import {ResponseError} from "@/rest/RestMethod";
import {useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";

export default function useEnvConfigHandler({selectedLanguage, dbConfigs}:
                                            {
                                                selectedLanguage: string,
                                                dbConfigs: Record<"engine" | "host" | "port" | "database" | "username" | "password", string>
                                            }) {

    const rest = useRestMethod();

    const [configuringEnv, setConfiguringEnv] = useState(false);
    const [envConfigurationError, setEnvConfigurationError] = useState<string | null>();

    const handleEnvConfiguration = () => {

        return new Promise<boolean>((resolve) => {

            setConfiguringEnv(true);
            setEnvConfigurationError(undefined);

            rest.execute(ConfigEnv, {
                language: selectedLanguage,
                ...dbConfigs
            })
                .then(() => {
                    resolve(true);
                })
                .catch((err: ResponseError) => {
                    setEnvConfigurationError(err.message);
                    resolve(false);
                })
                .finally(() => {
                    setConfiguringEnv(false);
                })
        })
    }

    return {
        configuringEnv, envConfigurationError, handleEnvConfiguration
    }

}