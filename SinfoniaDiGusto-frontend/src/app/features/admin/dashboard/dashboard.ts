import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
import { AdminStatsService } from '../services/admin-stats.service';
import { DashboardStats } from '../model/dashboardstats.model';

@Component({
  imports: [CommonModule, RouterLink, AdminHeader],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private statsService = inject(AdminStatsService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore nel recupero delle statistiche:', err);
        this.isLoading.set(false);
      }
    });
  }
}
