import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientUser } from '../model/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/users';

  /*
   Recupera la lista di tutti i clienti registrati
   */
  getClients(): Observable<ClientUser[]> {
    return this.http.get<ClientUser[]>(`${this.apiUrl}/admin/all`);
  }

  /*
   Cambia lo stato del cliente (Attiva / Blocca)
   */
  toggleClientStatus(id: number, active: boolean): Observable<ClientUser> {
    return this.http.patch<ClientUser>(`${this.apiUrl}/admin/${id}/toggle-status`, { active });
  }

  /*
   Elimina un account cliente
   */
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
  }
}