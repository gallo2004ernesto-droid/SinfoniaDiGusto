import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Badge } from '../model/badge.model';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/badges';

  // Pubblico (negozio): solo badge attivi
  getBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiUrl);
  }

  // Solo admin: tutti i badge, anche quelli disattivati
  getAdminBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.apiUrl}/admin`);
  }

  createBadge(badge: Badge): Observable<Badge> {
    return this.http.post<Badge>(this.apiUrl, badge);
  }

  updateBadge(id: number, badge: Badge): Observable<Badge> {
    return this.http.put<Badge>(`${this.apiUrl}/${id}`, badge);
  }

  deleteBadge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}