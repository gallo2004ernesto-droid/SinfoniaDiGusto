// import { HttpClient } from '@angular/common/http';
// import { computed, inject, Injectable, signal } from '@angular/core';
// import { AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../model/auth.model';
// import { Observable, tap } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private http = inject(HttpClient);

//   private apiUrl = 'http://localhost:8080/api/v1/auth';

//   // Utente attualmente autenticato
//   currentUser = signal<AuthResponse | null>(this.getStoredUser());

//   // true se l'utente è autenticato
//   isAuthenticated = computed(() => this.currentUser() !== null);

//   // true se l'utente è amministratore
//   isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

//   /**
//    * Registrazione
//    */
//   register(request: RegisterRequest): Observable<AuthResponse> {
//     return this.http
//       .post<AuthResponse>(`${this.apiUrl}/register`, request)
//       .pipe(
//         tap((response) => this.handleAuthSuccess(response))
//       );
//   }

//   /**
//    * Login
//    */
//   login(request: LoginRequest): Observable<AuthResponse> {
//     return this.http
//       .post<AuthResponse>(`${this.apiUrl}/login`, request)
//       .pipe(
//         tap((response) => this.handleAuthSuccess(response))
//       );
//   }

//   /**
//    * Salva token e informazioni utente
//    */
//   private handleAuthSuccess(response: AuthResponse): void {
//     localStorage.setItem('jwt_token', response.token);
//     localStorage.setItem('user_info', JSON.stringify(response));

//     this.currentUser.set(response);
//   }

//   /**
//    * Logout
//    */
//   logout(): void {
//     localStorage.removeItem('jwt_token');
//     localStorage.removeItem('user_info');

//     this.currentUser.set(null);
//   }

//   /**
//    * Recupera il JWT
//    */
//   getToken(): string | null {
//     return localStorage.getItem('jwt_token');
//   }

//   /**
//    * Controlla se l'utente possiede un determinato ruolo
//    */
//   hasRole(role: UserRole): boolean {
//     return this.currentUser()?.role === role;
//   }

//   /**
//    * Recupera l'utente salvato nel browser
//    */
//   private getStoredUser(): AuthResponse | null {
//     const stored = localStorage.getItem('user_info');

//     if (!stored) {
//       return null;
//     }

//     try {
//       return JSON.parse(stored) as AuthResponse;
//     } catch {
//       localStorage.removeItem('user_info');
//       return null;
//     }
//   }
// }

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, AuthResponse } from '../model/auth.model'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/auth';
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user_info';

  private readonly router = inject(Router);

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

    // Aggiorna lo stato dell'utente
    this.currentUser.set(null);

    // Reindirizza alla homepage
    this.router.navigateByUrl('/');
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


