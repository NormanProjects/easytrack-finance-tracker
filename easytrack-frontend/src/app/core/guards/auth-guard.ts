import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated && authService.hasValidToken()) {
    return true;
  }

  // Not logged in, redirect to login with return url
  console.log('Auth Guard: User not authenticated, redirecting to login');
  console.log('Attempted URL:', state.url);
  
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Optional: Public route guard (redirect to dashboard if already logged in)
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated, redirect to dashboard
  if (authService.isAuthenticated && authService.hasValidToken()) {
    console.log('Public Guard: User already authenticated, redirecting to dashboard');
    return router.createUrlTree(['/dashboard']);
  }

  // Not authenticated, allow access to public route
  return true;
};