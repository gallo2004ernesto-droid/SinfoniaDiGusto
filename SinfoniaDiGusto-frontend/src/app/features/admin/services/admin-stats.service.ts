import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { DashboardStats } from '../model/dashboardstats.model';

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/admin/stats';

    private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /*
    Chiamata HTTP GET al backend per le statistiche della dashboard
  */
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl,{
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Errore durante il recupero delle statistiche:', error);
        return throwError(() => new Error('Impossibile caricare le statistiche.'));
      })
    );
  }
}