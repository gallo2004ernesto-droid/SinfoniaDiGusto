import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStateService } from '../../../core/services/cart.services';
import { Product } from '../../../core/model/product.model';
import { ProductApiService } from '../../../core/services/product-api.service';


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  // Signal Input per il prodotto passato dal genitore
  product = input.required<Product>();

  private cartService = inject(CartStateService);

  // Costruisce l'URL completo verso Spring Boot
  getImageUrl(path?: string): string {
    if (!path) return 'assets/images/placeholder.jpg';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = 'http://localhost:8080';
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }

 
  // Optional: keep onAddToCart if you need it for direct calls
  onAddToCart(): void {
    this.cartService.addItem(this.product());
  }
}