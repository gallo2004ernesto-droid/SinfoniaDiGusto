import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartStateService } from '../../../core/services/cart.services'
import { OrderService } from '../../../core/services/order.service';
import { CouponService } from '../../../core/services/coupon.service';
import { CouponValidation } from '../../../core/model/coupon.model';
import { PaymentMethod, CreateOrderRequest } from "../../../core/model/order-status.model"
import { Header } from '../../../shared/component/header/header';
import { Footer } from '../../../shared/component/footer/footer';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    Header,
    Footer
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private couponService = inject(CouponService);
  private router = inject(Router);
  public cartState = inject(CartStateService);

  public selectedPaymentMethod = signal<PaymentMethod>('card');
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  
  // CODICE SCONTO
  

  public couponControl = new FormControl('', { nonNullable: true });
  public appliedCoupon = signal<CouponValidation | null>(null);
  public couponError = signal<string | null>(null);
  public isApplyingCoupon = signal<boolean>(false);

  // Lo sconto vale solo se il carrello non è cambiato dopo l'applicazione
  public activeCoupon = computed(() => {
    const coupon = this.appliedCoupon();

    if (!coupon) {
      return null;
    }

    return Math.abs(coupon.subtotal - this.cartState.totalPrice()) < 0.01
      ? coupon
      : null;
  });

  public discountAmount = computed(() => this.activeCoupon()?.discountAmount ?? 0);

  
  // TOTALI
  

  // La spedizione gratuita si calcola sul subtotale prima dello sconto
  public shippingCost = computed(() => {
    return this.cartState.totalPrice() > 50 ? 0 : 4.90;
  });

  public totalWithShipping = computed(() => {
    const discounted = Math.max(0, this.cartState.totalPrice() - this.discountAmount());
    return discounted + this.shippingCost();
  });

  public checkoutForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]{8,15}$')]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
    notes: ['']
  });

  getImageUrl(path?: string): string {
    if (!path) return 'assets/images/placeholder.jpg';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = 'http://localhost:8080';
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }

  selectPayment(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
  }

  
  // CODICE SCONTO: APPLICA / RIMUOVI
  

  // Invio nel campo codice: applica il codice senza inviare l'ordine
  onCouponEnter(event: Event): void {
    event.preventDefault();
    this.applyCoupon();
  }

  applyCoupon(): void {
    const code = this.couponControl.value.trim();

    if (!code) {
      this.couponError.set('Inserisci un codice sconto.');
      return;
    }

    this.isApplyingCoupon.set(true);
    this.couponError.set(null);

    const items = this.cartState.cartItems().map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    this.couponService.validateCoupon(code, items).subscribe({
      next: result => {
        this.appliedCoupon.set(result);
        this.couponControl.reset('');
        this.isApplyingCoupon.set(false);
      },
      error: err => {
        this.appliedCoupon.set(null);
        this.couponError.set(
          err?.error?.message || 'Impossibile verificare il codice sconto.'
        );
        this.isApplyingCoupon.set(false);
      }
    });
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponError.set(null);
  }

  
  // INVIO ORDINE
  

  submitOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValues = this.checkoutForm.value;

    const orderPayload: CreateOrderRequest = {
      items: this.cartState.cartItems().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      firstName: formValues.firstName!,
      lastName: formValues.lastName!,
      phone: formValues.phone!,
      address: formValues.address!,
      city: formValues.city!,
      postalCode: formValues.postalCode!,
      notes: formValues.notes || '',
      paymentMethod: this.selectedPaymentMethod(),
      couponCode: this.activeCoupon()?.code
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.cartState.clear();
        this.router.navigate(['/conferma-ordine', response.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || 'Si è verificato un errore durante la creazione dell\'ordine. Riprova.'
        );
      }
    });
  }
}