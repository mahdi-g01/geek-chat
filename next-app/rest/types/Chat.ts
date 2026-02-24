import {UserPublic} from "@/rest/types/User";

export interface ChatEncryptionProperty {
    id: number,
    chat_id: number,
    initiator_device_id: number,
    responder_device_id: number,
    initiator_public_key: string | null,
    responder_public_key: string | null,
    created_at: string,
    updated_at: string,
}

export interface Chat {
    id: string|number,
    title: string|null,
    last_message: string|null,
    description: string|null,
    dialog_target_user_id: number|null,
    created_at: string,
    updated_at: string,
    messages?: ChatMessages[],
    has_unseen_event?: boolean,
    avatar_url?: string,
    chat_type: "dialog"|"group"|"encrypted_dialog",
    encryption_property?: ChatEncryptionProperty|null,
}

export interface ChatMessages {
    id: string,
    chat_id: string,
    message_body: string,
    display_type: "message"|"image"|"video"|"link"|"image_group"|"file_group",
    is_edited: boolean,
    reply_target?: ChatMessages,
    user?: UserPublic,
    files?: {
        id: number,
        size: number|null,
        display_type: "file"|"prefer_preview",
        extension: "",
        name: string,
        created_at: string,
        updated_at: string,
    }[],
    created_at: string,
    updated_at: string,
}
