import {useCallback, useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import MakeDialog from "@/rest/methods/app/MakeDialog";

export default function useDialogMaker() {

    const [isMaking, setIsMaking] = useState(false);

    const rest = useRestMethod();

    const maker = useCallback((receiverUserId: number|string)=>{
        setIsMaking(true);
        return rest.execute(MakeDialog, {
            receiver_user_id: receiverUserId
        }).finally(()=>setIsMaking(false));
    }, [rest])

    return {
        make: maker, making: isMaking
    }

}