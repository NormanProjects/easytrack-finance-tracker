import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'easytrack_token';
  private readonly USER_KEY = 'easytrack_user';
  private isBrowser: boolean;

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Register a new user - CALLS REAL BACKEND
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    console.log(' Registering user:', data.email);
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data).pipe(
      tap(response => {
        console.log(' Registration successful:', response);
        this.handleAuthSuccess(response);
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Login user - CALLS REAL BACKEND
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log(' Logging in user:', credentials.email);
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        console.log(' Login successful:', response);
        this.handleAuthSuccess(response, credentials.rememberMe);
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    console.log(' Logging out...');
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
    }

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    this.router.navigate(['/auth/login']);
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY) || 
           localStorage.getItem('token') ||
           sessionStorage.getItem(this.TOKEN_KEY) ||
           sessionStorage.getItem('token');
  }

  /**
   * Check if token exists and is valid
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('hasValidToken: No token found');
      return false;
    }

    // For mock tokens (backward compatibility with demo mode)
    if (token.startsWith('mock-jwt-token')) {
      console.log(' hasValidToken: Mock token valid');
      return true;
    }

    // For real JWT tokens, check expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const isValid = Date.now() < expiry;
      console.log(isValid ? ' hasValidToken: Real token valid' : ' hasValidToken: Real token expired');
      return isValid;
    } catch (error) {
      console.error(' hasValidToken: Error validating token', error);
      return false;
    }
  }

  /**
   * Get current user (synchronous)
   */
  getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse, rememberMe: boolean = true): void {
    if (!this.isBrowser) return;

    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(this.TOKEN_KEY, response.token);
    storage.setItem('token', response.token);
    
    storage.setItem(this.USER_KEY, JSON.stringify(response.user));
    storage.setItem('currentUser', JSON.stringify(response.user));

    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
    
    console.log(' Auth success! Token stored:', response.token.substring(0, 20) + '...');
    console.log(' User stored:', response.user);
  }

  /**
   * Get stored user
   */
  private getStoredUser(): User | null {
    if (!this.isBrowser) return null;

    const userStr = localStorage.getItem(this.USER_KEY) || 
                    localStorage.getItem('currentUser') ||
                    sessionStorage.getItem(this.USER_KEY) ||
                    sessionStorage.getItem('currentUser');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(' Auth Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}