import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
import { BadgeService } from '../../../core/services/badge.service';
import { Badge } from '../../../core/model/badge.model';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminHeader
  ],
  templateUrl: './badgeComponent.html',
  styleUrl: './badgeComponent.css'
})
export class BadgeAdminComponent implements OnInit {

  private badgeService = inject(BadgeService);
  private fb = inject(NonNullableFormBuilder);

  // STATO

  badges = signal<Badge[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  pageError = signal<string | null>(null);
  formError = signal<string | null>(null);

  // FILTRI

  searchTerm = signal('');
  selectedStatus = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  filteredBadges = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.badges().filter(badge => {
      const matchesSearch =
        !term ||
        badge.name.toLowerCase().includes(term) ||
        badge.code.toLowerCase().includes(term);

      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && badge.is_active) ||
        (status === 'INACTIVE' && !badge.is_active);

      return matchesSearch && matchesStatus;
    });
  });

  // MODALE

  showModal = false;
  editingBadge: Badge | null = null;

  // FORM

  badgeForm = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    background_color: ['#dc2626', Validators.required],
    text_color: ['#ffffff', Validators.required],
    icon: ['🏷️', Validators.required],
    is_active: [true]
  });

  ngOnInit(): void {
    this.loadBadges();
  }

  // CARICAMENTO (admin: tutti i badge)

  loadBadges(): void {
    this.isLoading.set(true);
    this.pageError.set(null);

    this.badgeService.getAdminBadges().subscribe({
      next: badges => {
        this.badges.set(badges);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Errore caricamento badge:', err);
        this.pageError.set(
          this.extractError(err, 'Impossibile caricare i badge.')
        );
        this.isLoading.set(false);
      }
    });
  }

  // RESET FILTRI

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('ALL');
  }

  // CREAZIONE

  openCreateModal(): void {
    this.editingBadge = null;
    this.formError.set(null);

    this.badgeForm.reset({
      name: '',
      code: '',
      background_color: '#dc2626',
      text_color: '#ffffff',
      icon: '🏷️',
      is_active: true
    });

    this.showModal = true;
  }

  // MODIFICA

  openEditModal(badge: Badge): void {
    this.editingBadge = badge;
    this.formError.set(null);

    this.badgeForm.patchValue({
      name: badge.name,
      code: badge.code,
      background_color: badge.background_color || '#dc2626',
      text_color: badge.text_color || '#ffffff',
      icon: badge.icon || '🏷️',
      is_active: badge.is_active
    });

    this.showModal = true;
  }

  // CHIUSURA

  closeModal(): void {
    this.showModal = false;
    this.editingBadge = null;
    this.formError.set(null);
  }

  // SALVATAGGIO

  onSubmit(): void {
    if (this.badgeForm.invalid || this.isSaving()) {
      this.badgeForm.markAllAsTouched();
      return;
    }

    const value = this.badgeForm.getRawValue();

    const payload: Badge = {
      name: value.name.trim(),
      code: value.code.trim(),
      background_color: value.background_color,
      text_color: value.text_color,
      icon: value.icon.trim(),
      is_active: value.is_active
    };

    if (!payload.name || !payload.code || !payload.icon) {
      this.badgeForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.formError.set(null);

    const editingId = this.editingBadge?.id;

    const request = editingId != null
      ? this.badgeService.updateBadge(editingId, payload)
      : this.badgeService.createBadge(payload);

    request.subscribe({
      next: savedBadge => {
        this.badges.update(badges => {
          if (editingId != null) {
            return badges.map(badge =>
              badge.id === editingId ? savedBadge : badge
            );
          }

          return [...badges, savedBadge];
        });

        this.isSaving.set(false);
        this.closeModal();
      },
      error: err => {
        console.error('Errore salvataggio badge:', err);

        this.formError.set(
          this.extractError(err, 'Impossibile salvare il badge.')
        );
        this.isSaving.set(false);
      }
    });
  }

  // ELIMINAZIONE

  deleteBadge(id: number): void {
    const confirmed = confirm(
      'Sei sicuro di voler eliminare questo badge?'
    );

    if (!confirmed) {
      return;
    }

    this.pageError.set(null);

    this.badgeService.deleteBadge(id).subscribe({
      next: () => {
        this.badges.update(badges =>
          badges.filter(badge => badge.id !== id)
        );
      },
      error: err => {
        console.error('Errore eliminazione badge:', err);
        this.pageError.set(
          this.extractError(err, 'Impossibile eliminare il badge.')
        );
      }
    });
  }

  // MESSAGGIO DI ERRORE DAL BACKEND

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