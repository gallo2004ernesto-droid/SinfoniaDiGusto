import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
import { CouponService } from '../../../core/services/coupon.service';
import { Coupon, CouponStatus, DiscountType } from '../../../core/model/coupon.model';

@Component({
  selector: 'app-coupon',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminHeader
  ],
  templateUrl: './couponComponent.html',
  styleUrl: './couponComponent.css'
})
export class CouponAdminComponent implements OnInit {

  private couponService = inject(CouponService);
  private fb = inject(NonNullableFormBuilder);

  
  // STATO
  

  coupons = signal<Coupon[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  pageError = signal<string | null>(null);
  formError = signal<string | null>(null);

  
  // FILTRI
  

  searchTerm = signal('');
  selectedStatus = signal<'ALL' | CouponStatus>('ALL');

  filteredCoupons = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.coupons().filter(coupon => {
      const matchesSearch =
        !term ||
        coupon.code.toLowerCase().includes(term) ||
        (coupon.description ?? '').toLowerCase().includes(term);

      const matchesStatus =
        status === 'ALL' || coupon.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  
  // MODALE
  

  showModal = false;
  editingCoupon: Coupon | null = null;

  
  // FORM
  

  couponForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]{3,30}$/)]],
    description: [''],
    discountType: ['PERCENT' as DiscountType, Validators.required],
    discountValue: [10, [Validators.required, Validators.min(0.01)]],
    minOrderAmount: [null as number | null],
    validFrom: [''],
    validUntil: [''],
    usageLimit: [null as number | null],
    active: [true]
  });

  private readonly statusLabels: Record<CouponStatus, string> = {
    ACTIVE: 'Attivo',
    DISABLED: 'Disattivato',
    EXPIRED: 'Scaduto',
    SCHEDULED: 'Programmato',
    EXHAUSTED: 'Esaurito'
  };

  ngOnInit(): void {
    this.loadCoupons();
  }

  
  // CARICAMENTO
  

  loadCoupons(): void {
    this.isLoading.set(true);
    this.pageError.set(null);

    this.couponService.getCoupons().subscribe({
      next: coupons => {
        this.coupons.set(coupons);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Errore caricamento codici sconto:', err);
        this.pageError.set(
          this.extractError(err, 'Impossibile caricare i codici sconto.')
        );
        this.isLoading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('ALL');
  }

  
  // ETICHETTE
  

  statusLabel(status?: CouponStatus): string {
    return status ? this.statusLabels[status] : '';
  }

  statusClass(status?: CouponStatus): string {
    return status ? 'status-' + status.toLowerCase() : '';
  }

  
  // MODALE
  

  openCreateModal(): void {
    this.editingCoupon = null;
    this.formError.set(null);

    this.couponForm.controls.code.enable();

    this.couponForm.reset({
      code: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderAmount: null,
      validFrom: '',
      validUntil: '',
      usageLimit: null,
      active: true
    });

    this.showModal = true;
  }

  openEditModal(coupon: Coupon): void {
    this.editingCoupon = coupon;
    this.formError.set(null);

    this.couponForm.patchValue({
      code: coupon.code,
      description: coupon.description ?? '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount ?? null,
      validFrom: coupon.validFrom ?? '',
      validUntil: coupon.validUntil ?? '',
      usageLimit: coupon.usageLimit ?? null,
      active: coupon.active
    });

    // Dopo il primo utilizzo il codice non si può cambiare
    if ((coupon.usedCount ?? 0) > 0) {
      this.couponForm.controls.code.disable();
    } else {
      this.couponForm.controls.code.enable();
    }

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCoupon = null;
    this.formError.set(null);
  }

  // Genera un codice casuale di 8 caratteri (senza lettere ambigue come O e 0)
  generateCode(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';

    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    this.couponForm.controls.code.setValue(code);
  }

  
  // SALVATAGGIO
  

  onSubmit(): void {
    if (this.couponForm.invalid || this.isSaving()) {
      this.couponForm.markAllAsTouched();
      return;
    }

    const value = this.couponForm.getRawValue();

    if (value.discountType === 'PERCENT' && Number(value.discountValue) > 100) {
      this.formError.set('Lo sconto percentuale non può superare il 100%.');
      return;
    }

    if (value.validFrom && value.validUntil && value.validUntil < value.validFrom) {
      this.formError.set('La data di fine non può precedere quella di inizio.');
      return;
    }

    const payload: Coupon = {
      code: value.code.trim().toUpperCase(),
      description: value.description.trim() || null,
      discountType: value.discountType,
      discountValue: Number(value.discountValue),
      minOrderAmount:
        value.minOrderAmount != null ? Number(value.minOrderAmount) : null,
      validFrom: value.validFrom || null,
      validUntil: value.validUntil || null,
      usageLimit:
        value.usageLimit != null ? Number(value.usageLimit) : null,
      active: value.active
    };

    this.isSaving.set(true);
    this.formError.set(null);

    const editingId = this.editingCoupon?.id;

    const request = editingId != null
      ? this.couponService.updateCoupon(editingId, payload)
      : this.couponService.createCoupon(payload);

    request.subscribe({
      next: saved => {
        this.coupons.update(coupons => {
          if (editingId != null) {
            return coupons.map(coupon =>
              coupon.id === editingId ? saved : coupon
            );
          }

          return [saved, ...coupons];
        });

        this.isSaving.set(false);
        this.closeModal();
      },
      error: err => {
        console.error('Errore salvataggio codice sconto:', err);

        this.formError.set(
          this.extractError(err, 'Impossibile salvare il codice sconto.')
        );
        this.isSaving.set(false);
      }
    });
  }

  
  // ELIMINAZIONE
  

  deleteCoupon(id: number): void {
    const confirmed = confirm('Sei sicuro di voler eliminare questo codice sconto?');

    if (!confirmed) {
      return;
    }

    this.pageError.set(null);

    this.couponService.deleteCoupon(id).subscribe({
      next: () => {
        this.coupons.update(coupons =>
          coupons.filter(coupon => coupon.id !== id)
        );
      },
      error: err => {
        console.error('Errore eliminazione codice sconto:', err);
        this.pageError.set(
          this.extractError(err, 'Impossibile eliminare il codice sconto.')
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