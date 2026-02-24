export  interface UserPublic {
    id: string|number,
    public_name: string,
    bio_text: string,
    avatar_url?: string|null,
}

export interface UserPrivate extends UserPublic {
    user_name: string,
    national_id: string,
    is_admin?: boolean,
    last_seen_at?: string,
    is_banned?: boolean,
    phone: string,
    email: string,
    created_at: string,
    updated_at: string,
}
