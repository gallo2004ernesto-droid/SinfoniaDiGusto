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
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento clienti:', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleStatus(client: ClientUser): void {
    const newStatus = !client.active;
    this.clientService.toggleClientStatus(client.id, newStatus).subscribe({
      next: (updated) => {
        this.clients.update(list => list.map(c => c.id === updated.id ? updated : c));
      },
      error: (err) => console.error('Errore modifica stato cliente:', err)
    });
  }

  deleteClient(id?: number): void {
    if (id === undefined) return;

    if (confirm('Sei sicuro di voler eliminare questo cliente? L\'azione è irreversibile.')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.clients.update(list => list.filter(c => c.id !== id));
        },
        error: (err) => console.error('Errore eliminazione cliente:', err)
      });
    }
  }
}