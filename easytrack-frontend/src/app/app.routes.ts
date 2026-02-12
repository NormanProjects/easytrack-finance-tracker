import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth-guard';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { OverviewComponent } from './features/dashboard/components/overview/overview';
import { AnalyticsComponent } from './features/dashboard/components/analytics/analytics';
import { TransactionsComponent } from './features/dashboard/components/transactions/transactions';
import { SettingsComponent } from './features/dashboard/components/settings/settings';
import { CategoriesListComponent } from './features/categories/category-list/category-list';
import { AccountsListComponent } from './features/accounts/account-list/account-list';

export const routes: Routes = [
  // Landing page (home) - Public
  {
    path: '',
    component: LandingComponent
  },
  
  // Auth routes (public) - Redirect to dashboard if already logged in
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [publicGuard]  // Redirects to dashboard if already logged in
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [publicGuard]  // Redirects to dashboard if already logged in
  },

  // Protected routes - Require authentication
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]  // Must be logged in
  },
  {
    path: 'overview',
    component: OverviewComponent,
    canActivate: [authGuard]  // Must be logged in
  },
  {
    path: 'accounts',
    component: AccountsListComponent,
    canActivate: [authGuard]  // Must be logged in
  },
  {
    path: 'categories',
    component: CategoriesListComponent,
    canActivate: [authGuard]  // Must be logged in
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [authGuard]  // Must be logged in
  },
  {
    path: 'transactions',
    component: TransactionsComponent,
    canActivate: [authGuard]  // Must be logged in
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard]  // Must be logged in
  },
  
  // Fallback - redirect to landing
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];