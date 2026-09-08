import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole('ADMIN')) {
    return true;
  }

  // Se l'utente non è Admin, lo reindirizziamo alla home o al login
  router.navigate(['/forbidden']);
  return false;
};