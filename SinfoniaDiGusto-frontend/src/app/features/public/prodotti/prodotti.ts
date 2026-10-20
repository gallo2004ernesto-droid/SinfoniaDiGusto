import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductStateService } from '../../../core/services/product-state.service';
import { CategoryStateService } from '../../../core/services/category-state.service';
import { Header } from '../../../shared/component/header/header';
import { Footer } from '../../../shared/component/footer/footer';
import { Cart } from '../../../shared/component/cart/cart';
import { ProductCard } from '../../../shared/component/product-card/product-card';

@Component({
  selector: 'app-prodotti',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Header,
    Footer,
    Cart,
    ProductCard
  ],
  templateUrl: './prodotti.html',
  styleUrl: './prodotti.css'
})
export class ProductsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);

  public productState = inject(ProductStateService);
  public categoryState = inject(CategoryStateService);

  public isOffer = false;
  public cartOpen = false;

  // Signal calcolato che usa solo il nome della categoria
  public currentCategory = computed(() => {
    const selected = this.productState.selectedCategory();
    if (!selected) return { name: '' };

    const found = this.categoryState.categories().find(
      c => c.name.toLowerCase() === selected.toLowerCase()
    );

    return {
      name: found ? found.name : selected
    };
  });

  ngOnInit(): void {
    if (this.categoryState.loadCategories) {
      this.categoryState.loadCategories();
    }

    this.route.params.subscribe(params => {
      const currentUrl = this.route.snapshot.url.map(segment => segment.path).join('/');
      this.isOffer = currentUrl.includes('offerte');

      const categoryName = params['categoria'] || params['category'] || null;

      this.productState.onlyPromotions.set(this.isOffer);
      this.productState.selectedCategory.set(categoryName);

      if (this.productState.loadProducts) {
        this.productState.loadProducts();
      }
    });
  }

  ngOnDestroy(): void {
    // Uscendo dal catalogo i filtri non devono restare attivi nelle altre pagine
    this.productState.resetFilters();
  }

  openCart(): void {
    this.cartOpen = true;
  }

  closeCart(): void {
    this.cartOpen = false;
  }
}