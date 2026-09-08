import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderResponse } from '../model/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class OrderApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/orders';

  /**
   * Effettua la POST per salvare l'ordine sul backend
   */
  postOrder(order: Order): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.baseUrl, order);
  }

  /**
   * Recupera la lista di tutti gli ordini dell'utente
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/my-orders`);
  }

  /**
   * Recupera i dettagli di un ordine tramite il suo ID
   */
  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }
}