import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../model/order.model';

type StatusTab = 'ALL' | OrderStatus;
type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'TOTAL_DESC' | 'TOTAL_ASC';

interface StatusAction {
  status: OrderStatus;
  label: string;
  primary: boolean;
  danger: boolean;
}

@Component({
  imports: [CommonModule, FormsModule, AdminHeader],
  selector: 'app-order',
  styleUrl: './order.css',
  templateUrl: './order.html',
})
export class OrderAdmin implements OnInit {
  private orderService = inject(OrderService);

  private readonly baseUrl = 'http://localhost:8080';
  readonly pageSize = 15;

  readonly tabs: { key: StatusTab; label: string }[] = [
    { key: 'ALL', label: 'Tutti' },
    { key: 'PENDING', label: 'In attesa' },
    { key: 'PAID', label: 'Pagati' },
    { key: 'SHIPPED', label: 'Spediti' },
    { key: 'DELIVERED', label: 'Consegnati' },
    { key: 'CANCELLED', label: 'Annullati' }
  ];

  // Stesso flusso del backend (OrderService.ALLOWED_TRANSITIONS)
  private readonly transitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PAID', 'SHIPPED', 'CANCELLED'],
    PAID: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: []
  };

  private readonly actionLabels: Record<OrderStatus, string> = {
    PENDING: 'In attesa',
    PAID: 'Segna come pagato',
    SHIPPED: 'Segna come spedito',
    DELIVERED: 'Segna come consegnato',
    CANCELLED: 'Annulla ordine'
  };

  private readonly statusLabels: Record<OrderStatus, string> = {
    PENDING: 'In attesa',
    PAID: 'Pagato',
    SHIPPED: 'Spedito',
    DELIVERED: 'Consegnato',
    CANCELLED: 'Annullato'
  };

  private readonly paymentLabels: Record<string, string> = {
    card: 'Carta',
    paypal: 'PayPal',
    cash_on_delivery: 'Contanti alla consegna'
  };

  
  // STATO
  

  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  isUpdating = signal<boolean>(false);

  pageError = signal<string | null>(null);
  actionError = signal<string | null>(null);

  searchTerm = signal<string>('');
  activeTab = signal<StatusTab>('ALL');
  sortBy = signal<SortOption>('DATE_DESC');
  page = signal<number>(1);

  selectedOrderId = signal<number | null>(null);

  // L'ordine aperto si aggiorna da solo quando cambia la lista
  selectedOrder = computed(() =>
    this.orders().find(order => order.id === this.selectedOrderId()) ?? null
  );

  
  // RIEPILOGO
  

  stats = computed(() => {
    const orders = this.orders();
    const valid = orders.filter(order => order.status !== 'CANCELLED');
    const revenue = valid.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      total: orders.length,
      toProcess: orders.filter(
        order => order.status === 'PENDING' || order.status === 'PAID'
      ).length,
      revenue,
      average: valid.length > 0 ? revenue / valid.length : 0
    };
  });

  tabCounts = computed(() => {
    const counts: Record<string, number> = {
      ALL: 0, PENDING: 0, PAID: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0
    };

    for (const order of this.orders()) {
      counts['ALL']++;
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    }

    return counts;
  });

  
  // LISTA FILTRATA, ORDINATA E PAGINATA
  

  filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase().trim().replace(/^#/, '');
    const tab = this.activeTab();
    const sort = this.sortBy();

    const list = this.orders().filter(order => {
      const matchesTab = tab === 'ALL' || order.status === tab;

      const matchesSearch =
        !term ||
        String(order.id).includes(term) ||
        this.customerName(order).toLowerCase().includes(term) ||
        (order.userEmail ?? '').toLowerCase().includes(term) ||
        (order.phone ?? '').toLowerCase().includes(term);

      return matchesTab && matchesSearch;
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case 'DATE_ASC':
          return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
        case 'TOTAL_DESC':
          return b.totalAmount - a.totalAmount;
        case 'TOTAL_ASC':
          return a.totalAmount - b.totalAmount;
        default:
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      }
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize))
  );

  pagedOrders = computed(() => {
    const current = Math.min(this.page(), this.totalPages());
    const start = (current - 1) * this.pageSize;
    return this.filteredOrders().slice(start, start + this.pageSize);
  });

  
  // INIT
  

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.pageError.set(null);

    this.orderService.getAllOrders().subscribe({
      next: data => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Errore durante il caricamento degli ordini:', err);
        this.pageError.set(
          err?.error?.message || 'Impossibile caricare gli ordini.'
        );
        this.isLoading.set(false);
      }
    });
  }

  
  // FILTRI
  

  setTab(tab: StatusTab): void {
    this.activeTab.set(tab);
    this.page.set(1);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  onSort(value: SortOption): void {
    this.sortBy.set(value);
    this.page.set(1);
  }

  changePage(delta: number): void {
    const next = Math.min(Math.max(this.page() + delta, 1), this.totalPages());
    this.page.set(next);
  }

  
  // DETTAGLIO
  

  openOrder(order: Order): void {
    this.actionError.set(null);
    this.selectedOrderId.set(order.id);
  }

  @HostListener('document:keydown.escape')
  closeOrder(): void {
    this.selectedOrderId.set(null);
    this.actionError.set(null);
  }

  
  // AZIONI DI STATO
  

  actionsFor(order: Order): StatusAction[] {
    const next = this.transitions[order.status] ?? [];
    const forward = next.filter(status => status !== 'CANCELLED');

    return next.map(status => ({
      status,
      label: this.actionLabels[status],
      primary: status === forward[0],
      danger: status === 'CANCELLED'
    }));
  }

  changeStatus(order: Order, newStatus: OrderStatus): void {
    if (this.isUpdating()) {
      return;
    }

    if (newStatus === 'CANCELLED') {
      const confirmed = confirm(
        `Annullare l'ordine #${order.id}?\n\n` +
        `I prodotti torneranno in magazzino e l'eventuale codice sconto tornerà disponibile. ` +
        `L'operazione non si può annullare.`
      );

      if (!confirmed) {
        return;
      }
    }

    this.isUpdating.set(true);
    this.actionError.set(null);

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: updated => {
        this.orders.update(list =>
          list.map(item => (item.id === updated.id ? updated : item))
        );
        this.isUpdating.set(false);
      },
      error: err => {
        console.error('Errore aggiornamento stato ordine:', err);
        this.actionError.set(
          err?.error?.message || 'Impossibile aggiornare lo stato dell\'ordine.'
        );
        this.isUpdating.set(false);
      }
    });
  }

  
  // ETICHETTE E HELPER
  

  customerName(order: Order): string {
    return `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim() || order.userEmail;
  }

  statusLabel(status: OrderStatus): string {
    return this.statusLabels[status] ?? status;
  }

  statusClass(status: OrderStatus): string {
    return 'status-' + String(status).toLowerCase();
  }

  paymentLabel(method: string): string {
    return this.paymentLabels[method] ?? method;
  }

  itemsCount(order: Order): number {
    return (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
  }

  getImageUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path.startsWith('/') ? `${this.baseUrl}${path}` : `${this.baseUrl}/${path}`;
  }
}