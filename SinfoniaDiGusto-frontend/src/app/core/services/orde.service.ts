import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { OrderApiService } from './order-api.services';
import { CartStateService } from './cart.services';

import {
  Order as CheckoutOrder,
  OrderResponse,
  PaymentMethod,
  ShippingDetails
} from '../model/checkout.model';

import {
  OrderResponse as Ordini,
  OrderStatus
} from '../model/order-status.model';


@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderApi = inject(OrderApiService);
  private cartState = inject(CartStateService);

  // Lista degli ordini dell'utente
  orders = signal<OrderStatus[]>([]);

  ordini = signal<Ordini[]>([]);

  // Stato caricamento
  isLoading = signal<boolean>(false);

  // Errore
  error = signal<string | null>(null);


  /**
   * Carica la lista degli ordini dell'utente
   */
  loadMyOrders(): void {

    this.isLoading.set(true);
    this.error.set(null);

    this.orderApi.getMyOrders().subscribe({

      next: (data) => {
        this.isLoading.set(false);
      },

      error: (err) => {
        console.error(
          'Errore durante il recupero degli ordini:',
          err
        );

        this.error.set(
          'Impossibile caricare la lista degli ordini.'
        );

        this.isLoading.set(false);
      }

    });
  }


  /**
   * Converte lo stato dell'ordine
   * in etichetta e classe CSS.
   */
  getStatusBadge(
    status: OrderStatus
  ): { label: string; class: string } {

    switch (status) {

      case 'PENDING':
        return {
          label: 'In Attesa',
          class: 'status-pending'
        };

      case 'PROCESSING':
        return {
          label: 'In Lavorazione',
          class: 'status-processing'
        };

      case 'SHIPPED':
        return {
          label: 'Spedito',
          class: 'status-shipped'
        };

      case 'DELIVERED':
        return {
          label: 'Consegnato',
          class: 'status-delivered'
        };

      case 'CANCELLED':
        return {
          label: 'Annullato',
          class: 'status-cancelled'
        };
      case 'PAID':
        return {
          label: 'Annullato',
          class: 'status-cancelled'
        };

      default:
        return {
          label: 'Sconosciuto',
          class: ''
        };
    }
  }


  /**
   * Calcola le spese di spedizione.
   */
  calculateShippingCost(
    subtotal: number
  ): number {

    return subtotal > 50 ? 0 : 5;
  }


  /**
   * Crea e invia un nuovo ordine.
   */
  placeOrder(
    shippingData: ShippingDetails,
    paymentMethod: PaymentMethod
  ): Observable<OrderResponse> {

    const items = this.cartState.cartItems();

    const subtotal = this.cartState.totalPrice();

    const shippingCost =
      this.calculateShippingCost(subtotal);

    const total =
      subtotal + shippingCost;


    const orderPayload: CheckoutOrder = {

      items,

      shipping: shippingData,

      paymentMethod,

      subTotal: subtotal,

      shippingCost,

      total,

      createdAt: new Date()
    };


    return this.orderApi
      .postOrder(orderPayload)
      .pipe(

        tap((response) => {

          if (response.success) {
            this.cartState.clear();
          }

        })

      );
  }

}
