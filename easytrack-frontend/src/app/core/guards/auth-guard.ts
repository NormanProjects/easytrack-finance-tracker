// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if authenticated and has valid token
  if (authService.isAuthenticated() && authService.hasValidToken()) {
    return true;
  }

  // Redirect to login
  return router.createUrlTree(['/login']);
};