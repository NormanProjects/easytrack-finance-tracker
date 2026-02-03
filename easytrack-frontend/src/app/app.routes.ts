import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { OverviewComponent } from './features/dashboard/components/overview/overview';
import { Component } from '@angular/core';
import { AnalyticsComponent } from './features/dashboard/components/analytics/analytics';
import { TransactionsComponent } from './features/dashboard/components/transactions/transactions';

export const routes: Routes = [
  // Landing page (home)
  {
    path: '',
    component: LandingComponent
  },
  
  // Auth routes (public)
  {
    path: 'auth/login',
    component: LoginComponent 
  },
  {
    path: 'auth/register',
    component: RegisterComponent
  },
  {
    path: 'overview',
    component: OverviewComponent
  },
  {
   path: 'analytics',
    component: AnalyticsComponent
  },
  {
    path: 'transactions',
    component: TransactionsComponent
  },
  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent
    // canActivate: [authGuard] // Enable when ready
  },
  
  // Fallback - redirect to landing
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];