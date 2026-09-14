import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductStateService } from '../../../core/services/product-state.service';
import { CartStateService } from '../../../core/services/cart.services';
import { Product } from '../../../core/model/product.model';
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
  private cartState = inject(CartStateService);

  product = signal<Product | null>(null);
  quantity = signal<number>(1);
  isLoading = signal<boolean>(true);
  isOffertRoute = signal<boolean>(false);

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
        this.loadProduct(productId);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  private loadProduct(id: number): void {
    this.isLoading.set(true);
    const found = this.productState.products().find(p => p.id === id);

    if (found) {
      this.product.set(found);
    }

    this.isLoading.set(false);
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

  incrementQuantity(): void {
    this.quantity.update(q => q + 1);
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      this.cartState.addItem({
        ...currentProduct,
        imageUrl: this.getImageUrl(currentProduct.imageUrl)
      }, this.quantity());
    }
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