import {ChatEncryptionProperty} from "@/rest/types/Chat";
import {decryptMessage, deriveSharedAesKey, encryptMessage, getOtherPartyPublicKey} from "@/lib/encryption_handler";
import {getStoredPublicKeyBase64} from "@/lib/device_handler";
import {useCallback} from "react";

export default function useEncryptedDialogHelper( ) {

    const cryptoKey = useCallback(async (encryptionProperties?: ChatEncryptionProperty | null) => {
        if (!encryptionProperties)
            return false;

        const myPublicKey = await getStoredPublicKeyBase64();
        if (!myPublicKey)
            return false;

        const otherPartyPublicKey = getOtherPartyPublicKey(encryptionProperties, myPublicKey);
        if (!otherPartyPublicKey)
            return false;

        return await deriveSharedAesKey(otherPartyPublicKey);
    }, [])

    return {
        getCryptoKey: cryptoKey,
        encrypt: encryptMessage,
        decrypt: decryptMessage
    };

}