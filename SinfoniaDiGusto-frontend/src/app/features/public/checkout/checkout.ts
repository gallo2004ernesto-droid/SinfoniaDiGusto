import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartStateService } from '../../../core/services/cart.services'
import { OrderService } from '../../../core/services/order.service';
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
  private router = inject(Router);
  public cartState = inject(CartStateService);

  public selectedPaymentMethod = signal<PaymentMethod>('card');
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  public shippingCost = computed(() => {
    return this.cartState.totalPrice() > 50 ? 0 : 4.90;
  });

  public totalWithShipping = computed(() => {
    return this.cartState.totalPrice() + this.shippingCost();
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

  selectPayment(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
  }

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
      paymentMethod: this.selectedPaymentMethod()
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