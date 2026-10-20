import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductStateService } from '../../../core/services/product-state.service';
import { ProductApiService } from '../../../core/services/product-api.service';
import { CartStateService } from '../../../core/services/cart.services';
import { Product } from '../../../core/model/product.model';
import { Badge } from '../../../core/model/badge.model';
import { Cart } from "../../../shared/component/cart/cart";
import { Header } from '../../../shared/component/header/header';
import { CommonModule } from '@angular/common';
import { Footer } from '../../../shared/component/footer/footer';

@Component({
  imports: [CommonModule, RouterLink, Cart, Header, Footer],
  selector: 'app-dettaglio-prodotto',
  styleUrl: './dettaglio-prodotto.css',
  templateUrl: './dettaglio-prodotto.html',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productState = inject(ProductStateService);
  private productApi = inject(ProductApiService);
  private cartState = inject(CartStateService);

  product = signal<Product | null>(null);
  quantity = signal<number>(1);
  isLoading = signal<boolean>(true);
  isOffertRoute = signal<boolean>(false);

  // Solo i badge attivi (gli altri sono visibili solo all'admin)
  visibleBadges = computed(() =>
    (this.product()?.badges ?? []).filter(badge => badge.is_active)
  );

  
  // DISPONIBILITÀ E QUANTITÀ
  

  // Pezzi disponibili a magazzino
  stock = computed(() => this.product()?.stockQuantity ?? 0);

  // Pezzi di questo prodotto già presenti nel carrello
  inCartQuantity = computed(() => {
    const current = this.product();

    if (!current) {
      return 0;
    }

    return this.cartState
      .cartItems()
      .filter(item => item.product.id === current.id)
      .reduce((sum, item) => sum + item.quantity, 0);
  });

  // Pezzi che si possono ancora aggiungere
  maxQuantity = computed(() => Math.max(0, this.stock() - this.inCartQuantity()));

  isOutOfStock = computed(() => this.stock() <= 0);

  // Quantità mostrata: mai sopra il massimo, anche se il carrello cambia nel frattempo
  displayQuantity = computed(() =>
    Math.min(this.quantity(), Math.max(1, this.maxQuantity()))
  );

  private readonly baseUrl = 'http://localhost:8080'; // Cambia con l'URL del tuo backend

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const currentUrl = this.route.snapshot.url.map(segment => segment.path).join('/');
      this.isOffertRoute.set(currentUrl.includes('offerte'));

      let idParam = params.get('id');
      if (!idParam) {
        const segments = this.route.snapshot.url;
        idParam = segments[segments.length - 1]?.path;
      }

      const productId = Number(idParam);

      if (!isNaN(productId)) {
        this.quantity.set(1);
        this.loadProduct(productId);
      } else {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  private loadProduct(id: number): void {
    this.isLoading.set(true);

    // 1) Prima cerca nella lista già in memoria
    const found = this.productState.products().find(p => p.id === id);

    if (found) {
      this.product.set(found);
      this.isLoading.set(false);

      // Aggiorna in silenzio dal backend: lo stock potrebbe essere cambiato
      this.productApi.getProductById(id).subscribe({
        next: fresh => {
          if (this.product()?.id === fresh.id) {
            this.product.set(fresh);
          }
        },
        error: () => { }
      });

      return;
    }

    // 2) Accesso diretto o ricarica della pagina: lo chiede al backend
    this.productApi.getProductById(id).subscribe({
      next: product => {
        this.product.set(product);
        this.isLoading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  // Testo del badge; per "In Offerta" aggiunge la percentuale di sconto
  badgeLabel(badge: Badge): string {
    const base = [badge.icon, badge.name].filter(Boolean).join(' ');
    const discount = this.product()?.discountPercent;

    if (badge.code === 'OFFER' && discount) {
      return `${base} -${discount}%`;
    }

    return base;
  }

  // Costruisce l'URL completo per l'immagine del prodotto
  getImageUrl(path?: string): string {
    if (!path) return 'assets/images/placeholder.jpg';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path.startsWith('/') ? `${this.baseUrl}${path}` : `${this.baseUrl}/${path}`;
  }

  // Restituisce o apre l'URL completo del PDF
  getPdfUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path.startsWith('/') ? `${this.baseUrl}${path}` : `${this.baseUrl}/${path}`;
  }

  openPdf(): void {
    const rawUrl = this.product()?.pdfUrl;
    if (rawUrl) {
      const fullPdfUrl = this.getPdfUrl(rawUrl);
      window.open(fullPdfUrl, '_blank');
    }
  }

  
  // QUANTITÀ
  

  incrementQuantity(): void {
    const current = this.displayQuantity();

    if (current < this.maxQuantity()) {
      this.quantity.set(current + 1);
    }
  }

  decrementQuantity(): void {
    const current = this.displayQuantity();

    if (current > 1) {
      this.quantity.set(current - 1);
    }
  }

  addToCart(): void {
    const currentProduct = this.product();
    const amount = Math.min(this.displayQuantity(), this.maxQuantity());

    // Esaurito o già tutto nel carrello
    if (!currentProduct || amount < 1) {
      return;
    }

    this.cartState.addItem({
      ...currentProduct,
      imageUrl: this.getImageUrl(currentProduct.imageUrl)
    }, amount);

    // Dopo l'aggiunta si riparte da 1
    this.quantity.set(1);
  }

  // Carrello
  cartOpen = false;

  openCart(): void {
    this.cartOpen = true;
  }

  closeCart(): void {
    this.cartOpen = false;
  }
}