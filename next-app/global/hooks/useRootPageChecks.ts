import {useUser} from "@/global/contexts/UserContext";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import GetStage from "@/rest/methods/startup/GetStage";

export default function useRootPageChecks() {

    const rest = useRestMethod();

    const {isLoggedIn} = useUser();

    const isFinalStartupStage = async ()=>{
        const response = await rest.execute(GetStage);
        return response.stage == "stage_final_app_ready";
    }

    const getDecidedRedirectTarget: ()=>Promise<string> = ()=>{
        return new Promise(async (resolve, reject) => {
            if (await isLoggedIn()) {
                resolve( "/chat")
            }
            if (!(await isFinalStartupStage())) {
                resolve( "/startup")
            }
            resolve( "/login")
        })
    }

    return {
        getDecidedRedirectTarget
    }

}