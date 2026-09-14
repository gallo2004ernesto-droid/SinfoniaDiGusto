import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductStateService } from '../../../core/services/product-state.service';
import { Header } from '../../../shared/component/header/header';
import { HeroBanner } from '../../../shared/component/hero-banner/hero-banner';
import { CategorySlider } from '../../../shared/component/category-slider/category-slider';
import { ProductCard } from '../../../shared/component/product-card/product-card';
import { Footer } from '../../../shared/component/footer/footer';
import { Cart } from '../../../shared/component/cart/cart';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    Header, 
    HeroBanner, 
    CategorySlider, 
    ProductCard, 
    Footer, 
    Cart
  ],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class HomeComponent implements OnInit {
  protected productState = inject(ProductStateService);
  private router = inject(Router);

  cartOpen = false;

  // Signal locale collegata alle offerte
  saleProducts = computed(() => this.productState.saleProducts());

  ngOnInit(): void {
    // Carica tutti i prodotti dal DB Spring Boot
    this.productState.loadProducts();
  }

  onCategorySelect(categoryName: string): void {
    this.router.navigate(['/prodotti', categoryName.toLowerCase()]);
  }

  openCart(): void {
    this.cartOpen = true;
  }

  closeCart(): void {
    this.cartOpen = false;
  }
}