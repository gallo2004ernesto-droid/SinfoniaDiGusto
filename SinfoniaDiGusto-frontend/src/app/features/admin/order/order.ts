import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../model/order.model';

@Component({
  imports: [CommonModule, FormsModule, AdminHeader],
  selector: 'app-order',
  styleUrl: './order.css',
  templateUrl: './order.html',
})
export class OrderAdmin {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  selectedOrder = signal<Order | null>(null);

  readonly statusOptions: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  ngOnInit(): void{
    this.loadOrders();
  }


  loadOrders(): void{
    this.isLoading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (data) =>{
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) =>{
        console.error('Errore durante il caricamento degli ordini: ',err);
        this.isLoading.set(false)
      }
    });
  }

  changeStatus(orderId: number, event: Event):void{
    const newStatus = (event.target as HTMLSelectElement).value as OrderStatus;
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updateOrder) =>{
        this.orders.update(list => list.map(o => o.id === updateOrder.id ? updateOrder : o));
      },
      error: (err) => console.error('Errore aggiornamento stato ordine: ', err)
    })
  }

  viewDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeModal(): void {
    this.selectedOrder.set(null);
  }
}
