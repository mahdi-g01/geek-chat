/**
 * Backend pagination meta as returned by Laravel (e.g. admin all-users, all-chats).
 */
export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

/**
 * Generic paginated response: list of items + pagination meta.
 */
export type Paginated<T> = {
    items: T[];
    pagination: PaginationMeta;
};
