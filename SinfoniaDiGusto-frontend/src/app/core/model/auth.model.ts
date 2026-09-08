export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN'

export interface LoginRequest{
    email: string;
    password: string;
}

export interface RegisterRequest{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse{
    token: string;
    role: UserRole;
    email: string;
    firstName: string;
    lastName?: string; 
}