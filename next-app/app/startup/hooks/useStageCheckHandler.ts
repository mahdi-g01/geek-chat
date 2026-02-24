import {ResponseError} from "@/rest/RestMethod";
import {useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import GetStage from "@/rest/methods/startup/GetStage";
import {useRouter} from "next/navigation";

export default function useStageCheckHandler() {

    const rest = useRestMethod();
    const router = useRouter();

    const [loadingStage, setLoadingStage] = useState(false);
    const [stageLoadError, setStageLoadError] = useState<string | undefined>(undefined);
    const [stageIsOkForStartupProcedure, setStageIsOkForStartupProcedure] = useState<boolean>(false);

    const handleStageCheck = () => {

        return new Promise<boolean>((resolve) => {

            setLoadingStage(true);
            setStageLoadError(undefined);

            rest.execute(GetStage)
                .then((res) => {
                    if (res.stage != "stage_final_app_ready")
                        setStageIsOkForStartupProcedure(true);
                    else router.replace("/")
                    resolve(true);
                })
                .catch((err: ResponseError) => {
                    setStageLoadError(err.message);
                    resolve(false);
                })
                .finally(() => {
                    setLoadingStage(false)
                })
        })
    }

    return {
        stageIsOkForStartupProcedure, handleStageCheck, loadingStage, stageLoadError
    }

}