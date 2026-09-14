import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartStateService } from '../../../core/services/cart.services';
import { CategoryStateService } from '../../../core/services/category-state.service';
@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterLink],
  standalone: true,
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private cartService = inject(CartStateService);

  private categoryState = inject(CategoryStateService);

  // Esposizione del Signal alla vista HTML
  categories = this.categoryState.categories;

  //numero totale di elementi 
  cartCount = this.cartService.totalItems;

  //evento apertura carello laterale
  toggleCartEvent = output<void>();

  onOpenCart(): void{
    this.toggleCartEvent.emit();
  }
}
