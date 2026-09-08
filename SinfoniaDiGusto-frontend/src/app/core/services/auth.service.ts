import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../model/auth.model'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/auth';
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user_info';

   currentUser = signal<AuthResponse | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => this.saveSession(response))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response: AuthResponse) => this.saveSession(response))
    );
  }

  private saveSession(response: AuthResponse): void {
    if (response && response.token) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify({
        email: response.email,
        role: response.role,
        firstName: response.firstName,
        lastName: response.lastName
      }));
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Risolve l'errore 'isAuthenticated'
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

/**
 * Restituisce il ruolo SEMPRE formattato con "ROLE_" (es. "ADMIN", "USER")
 */
getUserRole(): string | null {
  const userStr = localStorage.getItem(this.USER_KEY);
  if (!userStr) return null;

  const user = JSON.parse(userStr);
  if (!user.role) return null;

  const roleStr = user.role.toString().toUpperCase();
  
  // Se ha già "ROLE_", lo restituisce, altrimenti lo aggiunge davanti
  return roleStr.startsWith('ROLE_') ? roleStr : `ROLE_${roleStr}`;
}

/**
 * Verifica se l'utente possiede il ruolo richiesto
 */
hasRole(expectedRole: string): boolean {
  const currentRole = this.getUserRole();
  if (!currentRole) return false;

  const formattedExpected = expectedRole.toUpperCase().startsWith('ROLE_') 
    ? expectedRole.toUpperCase() 
    : `ROLE_${expectedRole.toUpperCase()}`;

  return currentRole === formattedExpected;
}

private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem('user_info');

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthResponse;
    } catch {
      localStorage.removeItem('user_info');
      return null;
    }
  }
}


