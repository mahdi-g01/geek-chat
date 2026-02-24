import {UserPublic} from "@/rest/types/User";

export  interface AdminDashboardInfo {
    today_messages: number,
    total_messages: number,
    total_users: number,
    available_file_space_kb: number,
    occupied_space_kb: number,
    latest_users: UserPublic[],
}
