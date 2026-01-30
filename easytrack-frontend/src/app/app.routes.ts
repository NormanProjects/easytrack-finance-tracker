import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { Overview } from './features/dashboard/components/overview/overview';

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
    component: Overview
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