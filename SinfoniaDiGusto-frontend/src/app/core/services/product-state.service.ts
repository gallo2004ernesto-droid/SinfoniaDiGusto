// import { Injectable, inject, signal, computed } from '@angular/core';
// import { ProductApiService } from './product-api.service';
// import { Product } from '../model/product.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProductStateService {
//   private apiService = inject(ProductApiService);

//   // Signal di stato base
//   products = signal<Product[]>([]);
//   isLoading = signal<boolean>(false);
//   error = signal<string | null>(null);

//   readonly selectedCategory = signal<string | null>(null);
//   readonly onlyPromotions = signal<boolean>(false);

//   // Signal derivati calcolati automaticamente
//   featuredProducts = computed(() => 
//     this.products().filter(p => p.featured)
//   );

//   saleProducts = computed(() => 
//     this.products().filter(p => p.isOffer)
//   );

//   loadProducts(): void {
//     this.isLoading.set(true);
//     this.error.set(null);

//     this.apiService.getAllProducts().subscribe({
//       next: (data) => {
//         this.products.set(data);
//         this.isLoading.set(false);
//       },
//       error: (err) => {
//         console.error('Errore nel caricamento prodotti:', err);
//         this.error.set('Impossibile caricare le specialità. Riprova più tardi.');
//         this.isLoading.set(false);
//       }
//     });
//   }
// }

import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductApiService } from './product-api.service';
import { Product } from '../model/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductStateService {
  private apiService = inject(ProductApiService);

  // Stato base
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Filtri usati dalla pagina del catalogo
  readonly selectedCategory = signal<string | null>(null);
  readonly onlyPromotions = signal<boolean>(false);

  // Prodotti del catalogo, filtrati per categoria e offerte (pagina Prodotti)
  readonly filteredProducts = computed(() => {
    const products = this.products();

    const category = this.selectedCategory()
      ?.trim()
      .toLowerCase();

    const promotionsOnly = this.onlyPromotions();

    return products.filter(product => {
      // Filtro per nome categoria
      const matchesCategory =
        !category ||
        product.categoryName?.trim().toLowerCase() === category;

      // Filtro per offerte
      const matchesPromotion =
        !promotionsOnly || product.isOffer;

      return matchesCategory && matchesPromotion;
    });
  });

  // Home e banner: sempre sull'intero catalogo, indipendenti dai filtri del catalogo
  readonly featuredProducts = computed(() =>
    this.products().filter(product => product.featured)
  );

  readonly saleProducts = computed(() =>
    this.products().filter(product => product.isOffer)
  );

  // Rimette i filtri allo stato iniziale
  resetFilters(): void {
    this.selectedCategory.set(null);
    this.onlyPromotions.set(false);
  }

  loadProducts(): void {
    // Lo spinner compare solo al primo caricamento; dopo i dati restano visibili
    if (this.products().length === 0) {
      this.isLoading.set(true);
    }

    this.error.set(null);

    this.apiService.getAllProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento prodotti:', err);
        this.error.set(
          'Impossibile caricare le specialità. Riprova più tardi.'
        );
        this.isLoading.set(false);
      }
    });
  }
}