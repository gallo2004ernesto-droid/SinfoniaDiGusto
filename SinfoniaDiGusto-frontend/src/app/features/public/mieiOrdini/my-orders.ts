import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse, OrderStatus } from '../../../core/model/order-status.model';
import { Header } from '../../../shared/component/header/header';
import { Footer } from '../../../shared/component/footer/footer';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  public orders = signal<OrderResponse[]>([]);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);
  
  // Modificato da string | null a number | null per allinearlo a order.id (number)
  public expandedOrderId = signal<number | null>(null);

  ngOnInit(): void {
    this.fetchOrders();
  }

  private fetchOrders(): void {
    this.orderService.getUserOrders().subscribe({
      next: (data: OrderResponse[]) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare la lista degli ordini.');
        this.isLoading.set(false);
      }
    });
  }

  toggleOrderDetails(orderId: number): void {
    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(orderId);
    }
  }

  getStatusLabel(status: OrderStatus | string): string {
    switch (status) {
      case 'PENDING':
        return 'In Attesa di Conferma';
      case 'PAID':
        return 'Pagato';
      case 'SHIPPED':
        return 'Spedito';
      case 'DELIVERED':
        return 'Consegnato';
      case 'CANCELLED':
        return 'Annullato';
      default:
        return status;
    }
  }
}