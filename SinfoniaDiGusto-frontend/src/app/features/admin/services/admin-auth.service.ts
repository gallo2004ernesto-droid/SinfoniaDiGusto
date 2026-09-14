import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AdminUser, ChangePasswordPayload } from '../model/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/v1/admin/profile';

  currentUser = signal<AdminUser | null>(null);

  

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  fetchProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((user) => {
        console.log('PROFILO RICEVUTO DAL BACKEND:', user);
        this.currentUser.set(user);
      })
    );
  }

  getCurrentUser(): AdminUser | null {
    return this.currentUser();
  }

  updateProfile(data: { name: string; email: string }): Observable<AdminUser> {
    return this.http.put<AdminUser>(
      `${this.apiUrl}/update`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    ).pipe(
      tap((updatedUser) => {
        console.log('PROFILO AGGIORNATO:', updatedUser);

        this.currentUser.set(updatedUser);
      })
    );
  }

  changePassword(data: ChangePasswordPayload): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/change-password`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}
