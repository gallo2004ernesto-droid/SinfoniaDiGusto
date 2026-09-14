import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStateService } from '../../../core/services/cart.services';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  //iniezione del service separato per lo stato 
  cartState = inject(CartStateService);

  //input per la visibilità
  isOpen = input<boolean>(false);

  //evento di chiusura
  closeCart = output<void>();

  onClose(): void{
    this.closeCart.emit();
  }
}
