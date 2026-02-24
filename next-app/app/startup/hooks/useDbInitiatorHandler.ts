import ConfigEnv from "@/rest/methods/startup/ConfigEnv";
import {ResponseError} from "@/rest/RestMethod";
import {useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import InitiateDb from "@/rest/methods/startup/InitiateDb";

export default function useDbInitiatorHandler() {

    const rest = useRestMethod();

    const [initiatingDb, setInitiatingDb] = useState(false);
    const [dbInitiationError, setDbInitiationError] = useState<string | null>();

    const handleDbInitiation = () => {

        return new Promise<boolean>((resolve) => {

            setInitiatingDb(true);
            setDbInitiationError(undefined);

            rest.execute(InitiateDb)
                .then(() => {
                    resolve(true);
                })
                .catch((err: ResponseError) => {
                    resolve(false);
                    setDbInitiationError(err.message)
                })
                .finally(() => {
                    setInitiatingDb(false);
                })
        })
    }

    return {
        handleDbInitiation, initiatingDb, dbInitiationError
    }

}