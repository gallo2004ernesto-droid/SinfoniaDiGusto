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

   getImageUrl(path?: string): string {
    if (!path) return 'assets/images/placeholder.jpg';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = 'http://localhost:8080';
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }
}
