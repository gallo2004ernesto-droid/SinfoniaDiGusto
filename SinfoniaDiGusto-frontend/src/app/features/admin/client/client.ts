import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
import { ClientService } from '../services/client.service';
import { ClientUser } from '../model/client.model';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminHeader],
  templateUrl: './client.html',
  styleUrl: './client.css'
})
export class ClientManagementComponent implements OnInit {
  private clientService = inject(ClientService);

  clients = signal<ClientUser[]>([]);
  isLoading = signal<boolean>(true);
  searchTerm = signal<string>('');

  errorMessage = signal<string | null>(null);

  // Cliente su cui è in corso un'operazione (blocca i suoi pulsanti)
  busyId = signal<number | null>(null);

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.clients().filter(client =>
      !term ||
      client.firstName.toLowerCase().includes(term) ||
      client.lastName.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento clienti:', err);
        this.errorMessage.set(this.extractError(err, 'Impossibile caricare i clienti.'));
        this.isLoading.set(false);
      }
    });
  }

  toggleStatus(client: ClientUser): void {
    if (client.id === undefined || this.busyId() !== null) return;

    this.errorMessage.set(null);
    this.busyId.set(client.id);

    this.clientService.toggleClientStatus(client.id, !client.active).subscribe({
      next: (updated) => {
        this.clients.update(list => list.map(c => c.id === updated.id ? updated : c));
        this.busyId.set(null);
      },
      error: (err) => {
        console.error('Errore modifica stato cliente:', err);
        this.errorMessage.set(this.extractError(err, 'Impossibile modificare lo stato del cliente.'));
        this.busyId.set(null);
      }
    });
  }

  deleteClient(id?: number): void {
    if (id === undefined || this.busyId() !== null) return;

    if (!confirm('Sei sicuro di voler eliminare questo cliente? L\'azione è irreversibile.')) {
      return;
    }

    this.errorMessage.set(null);
    this.busyId.set(id);

    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.clients.update(list => list.filter(c => c.id !== id));
        this.busyId.set(null);
      },
      error: (err) => {
        console.error('Errore eliminazione cliente:', err);
        this.errorMessage.set(
          this.extractError(
            err,
            'Impossibile eliminare il cliente. Se ha degli ordini, puoi bloccarlo invece di eliminarlo.'
          )
        );
        this.busyId.set(null);
      }
    });
  }

  // Messaggio inviato dal backend, se presente
  private extractError(err: any, fallback: string): string {
    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.status === 403) {
      return 'Non hai i permessi per questa operazione.';
    }

    return fallback;
  }
}