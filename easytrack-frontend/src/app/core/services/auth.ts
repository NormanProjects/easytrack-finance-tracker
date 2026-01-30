
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest
} from '../models/user.model';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.isBrowser ? this.getStoredUser() : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get current user value
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if token is valid (for auth guard)
   */
  public hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // TODO: Add token expiration check if needed
    return true;
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Remove rememberMe from the request if it exists (backend doesn't need it)
    const { rememberMe, ...loginData } = credentials;
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Remove name from the request if it exists (backend uses firstName/lastName)
    const { name, ...registerData } = userData;
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get stored JWT token
   */
  public getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Handle successful authentication response
   */
  private handleAuthResponse(response: AuthResponse): void {
    if (!this.isBrowser) return;

    // Store token
    localStorage.setItem('auth_token', response.token);
    
    // Create user object
    const user: User = {
      id: response.userId,
      email: response.email,
      name: `${response.firstName} ${response.lastName}`,
      firstName: response.firstName,
      lastName: response.lastName
    };
    
    // Store user
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    if (!this.isBrowser) return null;

    try {
      const userJson = localStorage.getItem('current_user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  /**
   * Remove token from storage
   */
  private removeToken(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('auth_token');
  }

  /**
   * Remove user from storage
   */
  private removeUser(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('current_user');
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Auth Error:', error);
    
    let errorMessage = 'An error occurred during authentication';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden';
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {})
      .pipe(
        tap(response => {
          if (this.isBrowser) {
            localStorage.setItem('auth_token', response.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verify token validity
   */
  verifyToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.http.get<boolean>(`${this.apiUrl}/verify`)
      .pipe(
        catchError(() => {
          this.logout();
          return throwError(() => new Error('Token verification failed'));
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(userData: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData)
      .pipe(
        tap(user => {
          if (this.isBrowser) {
            localStorage.setItem('current_user', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Change password
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, passwordData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }
}

