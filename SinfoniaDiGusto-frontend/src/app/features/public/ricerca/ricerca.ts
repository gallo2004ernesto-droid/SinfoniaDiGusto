import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

import { ProductApiService } from '../../../core/services/product-api.service';
import { Product } from '../../../core/model/product.model';
import { Header } from '../../../shared/component/header/header';
import { Footer } from '../../../shared/component/footer/footer';
import { Cart } from '../../../shared/component/cart/cart';
import { ProductCard } from '../../../shared/component/product-card/product-card';

type SortOption = 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME';

@Component({
  selector: 'app-ricerca',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, Cart, ProductCard],
  templateUrl: './ricerca.html',
  styleUrl: './ricerca.css'
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productApi = inject(ProductApiService);
  private destroyRef = inject(DestroyRef);

  query = signal('');
  results = signal<Product[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  sortBy = signal<SortOption>('RELEVANCE');

  cartOpen = false;

  // "Rilevanza" mantiene l'ordine del backend (prima i prodotti con il termine nel nome)
  sortedResults = computed(() => {
    const list = [...this.results()];

    switch (this.sortBy()) {
      case 'PRICE_ASC':
        return list.sort((a, b) => a.price - b.price);
      case 'PRICE_DESC':
        return list.sort((a, b) => b.price - a.price);
      case 'NAME':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'it'));
      default:
        return list;
    }
  });

  ngOnInit(): void {
    // Ogni volta che cambia ?q=... la ricerca riparte, annullando quella in corso
    this.route.queryParamMap
      .pipe(
        map(params => (params.get('q') ?? '').trim()),
        distinctUntilChanged(),
        tap(query => {
          this.query.set(query);
          this.sortBy.set('RELEVANCE');
          this.error.set(null);
          this.results.set([]);
          this.isLoading.set(query.length > 0);
        }),
        switchMap(query =>
          query
            ? this.productApi.searchProducts(query).pipe(
                catchError(err => {
                  console.error('Errore ricerca prodotti:', err);
                  this.error.set('Impossibile eseguire la ricerca. Riprova tra poco.');
                  return of([] as Product[]);
                })
              )
            : of([] as Product[])
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(results => {
        this.results.set(results);
        this.isLoading.set(false);
      });
  }

  onSubmit(event: Event, value: string): void {
    event.preventDefault();

    const term = value.trim();

    if (!term) {
      return;
    }

    this.router.navigate(['/cerca'], { queryParams: { q: term } });
  }

  onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
  }

  openCart(): void {
    this.cartOpen = true;
  }

  closeCart(): void {
    this.cartOpen = false;
  }
}