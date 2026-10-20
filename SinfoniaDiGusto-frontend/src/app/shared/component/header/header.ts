import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DOCUMENT } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { CartStateService } from '../../../core/services/cart.services';
import { CategoryStateService } from '../../../core/services/category-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductApiService } from '../../../core/services/product-api.service';
import { Product } from '../../../core/model/product.model';

type NavSection = 'products' | 'services';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive],
  standalone: true,
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private cartService = inject(CartStateService);
  private categoryState = inject(CategoryStateService);
  private authService = inject(AuthService);
  private productApi = inject(ProductApiService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);
  private document = inject(DOCUMENT);

  // Esposizione del Signal alla vista HTML
  categories = this.categoryState.categories;

  // numero totale di elementi
  cartCount = this.cartService.totalItems;

  // evento apertura carrello laterale
  toggleCartEvent = output<void>();

  
  // MENU MOBILE (pannello laterale)
  

  menuOpen = signal(false);
  openSection = signal<NavSection | null>(null);

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    this.closeAccountMenu();
    this.closeSearch();
    this.menuOpen.set(true);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.openSection.set(null);
  }

  // Apre o chiude un gruppo del menu (Prodotti, Servizi clienti)
  toggleSection(section: NavSection): void {
    this.openSection.update(current => (current === section ? null : section));
  }

  // Un clic su un link del menu lo chiude (anche se la pagina è la stessa)
  onNavClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (target.closest('a')) {
      this.closeMenu();
    }
  }

  
  // ACCOUNT
  

  accountMenuOpen = false;

  userName = computed(() => this.authService.currentUser()?.firstName ?? '');

  userInitial = computed(() => this.userName().trim().charAt(0).toUpperCase());

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  toggleAccountMenu(): void {
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  closeAccountMenu(): void {
    this.accountMenuOpen = false;
  }

  onLogout(): void {
    this.closeAccountMenu();
    this.authService.logout();
  }

  // Tocco o clic fuori dal menu account: lo chiude
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.accountMenuOpen) {
      return;
    }

    const menu = (this.host.nativeElement as HTMLElement).querySelector('.account-menu');

    if (menu && !menu.contains(event.target as Node)) {
      this.closeAccountMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAccountMenu();
    this.closeSearch();
    this.closeMenu();
  }

  // Passando a una finestra larga il pannello mobile non deve restare aperto
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992 && this.menuOpen()) {
      this.closeMenu();
    }
  }

  
  // RICERCA
  

  searchOpen = signal(false);
  searchTerm = signal('');
  suggestions = signal<Product[]>([]);
  isSearching = signal(false);

  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(300),
        map(term => term.trim()),
        distinctUntilChanged(),
        tap(term => this.isSearching.set(term.length >= 2)),
        switchMap(term =>
          term.length < 2
            ? of([] as Product[])
            : this.productApi.searchProducts(term).pipe(
                catchError(() => of([] as Product[]))
              )
        ),
        takeUntilDestroyed()
      )
      .subscribe(results => {
        this.suggestions.set(results.slice(0, 5));
        this.isSearching.set(false);
      });

    // Cambio pagina: chiude menu mobile e menu account
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.closeMenu();
        this.closeAccountMenu();
      });

    // Con menu o ricerca aperti la pagina sotto non deve scorrere
    effect(() => {
      const locked = this.menuOpen() || this.searchOpen();
      this.document.body.style.overflow = locked ? 'hidden' : '';
    });

    inject(DestroyRef).onDestroy(() => {
      this.document.body.style.overflow = '';
    });
  }

  openSearch(): void {
    this.closeAccountMenu();
    this.closeMenu();
    this.searchOpen.set(true);

    // Aspetta che il pannello sia nel DOM, poi porta il cursore nel campo
    setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
  }

  closeSearch(): void {
    if (!this.searchOpen()) {
      return;
    }

    this.searchOpen.set(false);
    this.searchTerm.set('');
    this.suggestions.set([]);
    this.isSearching.set(false);

    // Azzera anche il flusso, così riscrivere la stessa parola funziona
    this.search$.next('');
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.search$.next(value);
  }

  // Invio o "Vedi tutti i risultati": apre la pagina dei risultati
  onSearchSubmit(event?: Event): void {
    event?.preventDefault();

    const term = this.searchTerm().trim();

    if (!term) {
      return;
    }

    this.closeSearch();
    this.router.navigate(['/cerca'], { queryParams: { q: term } });
  }

  goToProduct(product: Product): void {
    this.closeSearch();
    this.router.navigate([
      '/prodotti',
      (product.categoryName || 'all').toLowerCase(),
      product.id
    ]);
  }

  getImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = 'http://localhost:8080';
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }

  
  // CARRELLO
  

  onOpenCart(): void {
    this.toggleCartEvent.emit();
  }
}