import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductApiService } from './product-api.service';
import { Product } from '../model/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductStateService {
  private apiService = inject(ProductApiService);

  // Signal di stato base
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  readonly selectedCategory = signal<string | null>(null);
  readonly onlyPromotions = signal<boolean>(false);

  // Signal derivati calcolati automaticamente
  featuredProducts = computed(() => 
    this.products().filter(p => p.featured)
  );

  saleProducts = computed(() => 
    this.products().filter(p => p.isOffer)
  );

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.getAllProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento prodotti:', err);
        this.error.set('Impossibile caricare le specialità. Riprova più tardi.');
        this.isLoading.set(false);
      }
    });
  }
}