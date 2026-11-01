import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Header } from '../../../shared/component/header/header';
import { Footer } from '../../../shared/component/footer/footer';
import { Cart } from '../../../shared/component/cart/cart';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, Cart],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css'
})
export class ForbiddenComponent {
  private authService = inject(AuthService);
  private location = inject(Location);

  cartOpen = false;

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  goBack(): void {
    this.location.back();
  }

  openCart(): void {
    this.cartOpen = true;
  }

  closeCart(): void {
    this.cartOpen = false;
  }
}