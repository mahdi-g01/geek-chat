import {useCallback, useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import InitiateEncryptedDialog from "@/rest/methods/app/InitiateEncryptedDialog";

export default function useEncryptedDialogMaker() {

    const [isMaking, setIsMaking] = useState(false);

    const rest = useRestMethod();

    const maker = useCallback((receiverUserId: number|string)=>{
        setIsMaking(true);
        return rest.execute(InitiateEncryptedDialog, {
            receiver_user_id: receiverUserId
        }).finally(()=>setIsMaking(false));
    }, [rest])

    return {
        make: maker, making: isMaking
    }

}