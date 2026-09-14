export interface AdminUser {
  id?: number;
  firstName: string;
  email: string;
  role?: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
}