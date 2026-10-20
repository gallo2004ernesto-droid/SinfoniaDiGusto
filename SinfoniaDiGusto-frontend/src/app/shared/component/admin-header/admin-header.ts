import { Component, HostListener, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive],
  selector: 'app-admin-header',
  styleUrl: './admin-header.css',
  templateUrl: './admin-header.html',
})
export class AdminHeader {
  public authService = inject(AuthService);
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1200) {
      this.closeMenu();
    }
  }
}