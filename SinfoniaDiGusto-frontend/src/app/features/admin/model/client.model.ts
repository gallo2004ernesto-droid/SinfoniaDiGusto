export interface ClientUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
  registrationDate: string;
}