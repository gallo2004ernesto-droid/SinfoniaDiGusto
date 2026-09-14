import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse, OrderStatus } from '../../../core/model/order-status.model';
import { Header } from '../../../shared/component/header/header';
import { Footer } from '../../../shared/component/footer/footer';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, Header],
  template: `
    <app-header></app-header>
    <main class="confirmation-container">
      <div class="confirmation-card">
        <i class="fa-solid fa-circle-check check-icon"></i>
        <h1>Ordine Confermato!</h1>
        <p>Grazie per il tuo acquisto su <strong>Sinfonia Di Gusto</strong>.</p>
        <p class="sub-text">Abbiamo inviato un'email di conferma con il riepilogo del tuo ordine.</p>
        <a routerLink="/prodotti" class="btn-home">Torna al Catalogo</a>
      </div>
    </main>
  `,
  styles: [`
    .confirmation-container {
      max-width: 600px;
      margin: 60px auto;
      padding: 0 20px;
      text-align: center;
    }
    .confirmation-card {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      border: 1px solid #f0e6df;
    }
    .check-icon {
      font-size: 4rem;
      color: #2e7d32;
      margin-bottom: 20px;
    }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      color: #3e2723;
      margin-bottom: 12px;
    }
    p {
      color: #6d4c41;
      font-size: 1.05rem;
      margin: 4px 0;
    }
    .sub-text {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 28px;
    }
    .btn-home {
      display: inline-block;
      padding: 12px 28px;
      background-color: #3e2723;
      color: white;
      border-radius: 25px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 0.2s;
    }
    .btn-home:hover {
      background-color: #e91e63;
    }
  `]
})
export class OrderConfermationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  public order = signal<OrderResponse | null>(null);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.fetchOrderDetails(Number(idParam));
    } else {
      this.isLoading.set(false);
      this.error.set('Nessun ID ordine specificato.');
    }
  }

  private fetchOrderDetails(id: number): void {
    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossibile recuperare i dettagli dell\'ordine.');
        this.isLoading.set(false);
      }
    });
  }

  // Helper per tradurre lo stato dell'ordine per l'utente
  getStatusLabel(status: OrderStatus | undefined): string {
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
        return 'In Elaborazione';
    }
  }
}