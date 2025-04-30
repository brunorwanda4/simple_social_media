export interface PublicUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    created_at: string;
}

export interface Product {
    id: number;
    name: string;
    category_id: number | null;
    created_at: string;
    category_name: string | null;
}
