// import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   imports: [RouterOutlet],
//   selector: 'app-root',
//   styles: [],
//   template: `
//     <router-outlet />
//   `,
// })
// export class App {
//   protected readonly title = signal('SinfoniaDiGusto-frontend');
// }

import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `
    <router-outlet />

    <!-- Quadratino visibile solo su Desktop e SOLO nelle pagine pubbliche (non in /admin) -->
    @if (!isAdminRoute()) {
      <div class="desktop-box" title="Torna in alto" (click)="scrollToTop()">
        <i class="fa-solid fa-arrow-up"></i>
      </div>
    }
  `,
  styles: [`
    .desktop-box {
      position: fixed;
      bottom: 25px;
      right: 25px;
      width: 48px;
      height: 48px;
      background-color: var(--primary-brown, #5c3d2e);
      color: #fff;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(92, 61, 46, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      cursor: pointer;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .desktop-box:hover {
      transform: translateY(-3px);
      background-color: var(--secondary-brown, #966f57);
    }

    /* Nascondi automaticamente su dispositivi mobile o schermi piccoli (< 768px) */
    @media (max-width: 767px), (pointer: coarse) {
      .desktop-box {
        display: none !important;
      }
    }
  `],
})
export class App {
  protected readonly title = signal('SinfoniaDiGusto-frontend');
  
  // Signal reattivo per tracciare se siamo in area admin
  protected readonly isAdminRoute = signal<boolean>(false);

  constructor(private router: Router) {
    // Ascolta i cambi di rotta e aggiorna il signal
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event) => {
      this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
    });
  }

  // Funzione opzionale per far scorrere la pagina dolcemente in cima al click
  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}