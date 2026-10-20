import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStatus } from '../model/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin`);
  }

  // Il backend riceve lo stato come parametro: PATCH /admin/{id}/status?status=SHIPPED
  updateOrderStatus(orderId: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/admin/${orderId}/status`,
      null,
      { params: { status } }
    );
  }
}