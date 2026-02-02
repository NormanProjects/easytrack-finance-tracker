import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of, delay } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api';
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

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!storedUser);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    // Mock registration - replace with real API call
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      }
    };

    return of(mockResponse).pipe(
      delay(1000),
      tap(response => {
        console.log('Mock registration successful:', response);
        this.handleAuthSuccess(response);
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );

    // Use this for real backend:
    // return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data)
    //   .pipe(
    //     tap(response => this.handleAuthSuccess(response)),
    //     catchError((error: HttpErrorResponse) => this.handleError(error))
    //   );
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Mock login - replace with real API call
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        name: 'Demo User',
        email: credentials.email,
        firstName: 'Demo',
        lastName: 'User'
      }
    };

    return of(mockResponse).pipe(
      delay(1000),
      tap(response => {
        console.log('Mock login successful:', response);
        this.handleAuthSuccess(response, credentials.rememberMe);
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );

    // Use this for real backend:
    // return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
    //   .pipe(
    //     tap(response => this.handleAuthSuccess(response, credentials.rememberMe)),
    //     catchError((error: HttpErrorResponse) => this.handleError(error))
    //   );
  }

  /**
   * Logout user
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
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
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if token exists and is valid
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch (error) {
      // For mock tokens, just return true if token exists
      return true;
    }
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, {})
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Get current user from backend
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse, rememberMe: boolean = true): void {
    if (!this.isBrowser) return;

    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(this.TOKEN_KEY, response.token);
    storage.setItem(this.USER_KEY, JSON.stringify(response.user));

    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Get stored user
   */
  private getStoredUser(): User | null {
    if (!this.isBrowser) return null;

    const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
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

    console.error('Auth Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}