import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Check multiple locations for token
  const token = 
    localStorage.getItem('easytrack_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('easytrack_token') ||
    sessionStorage.getItem('token');
  
  console.log(' Auth Interceptor:');
  console.log('  - URL:', req.url);
  console.log('  - Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  
  // Clone request and add token if exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('  - Authorization header added!');
  } else {
    console.warn('  -  NO TOKEN - Request will fail!');
    console.warn('  - Check storage:', {
      localStorage: !!localStorage.getItem('easytrack_token'),
      token: !!localStorage.getItem('token')
    });
  }
  
  // Handle response
  return next(req).pipe(
    catchError((error) => {
      console.error('❌ Request error:', error.status, error.message);
      
      // DON'T auto-logout on 403 - let the backend accept the token first!
      // Only logout on 401 Unauthorized (invalid/expired token)
      if (error.status === 401) {
        console.log('401 Unauthorized - clearing tokens and redirecting');
        localStorage.removeItem('easytrack_token');
        localStorage.removeItem('token');
        localStorage.removeItem('easytrack_user');
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        router.navigate(['/auth/login']);
      }
      // For 403, just log it but don't logout
      else if (error.status === 403) {
        console.warn('403 Forbidden - backend rejecting request (check backend JWT filter)');
      }
      
      return throwError(() => error);
    })
  );
};