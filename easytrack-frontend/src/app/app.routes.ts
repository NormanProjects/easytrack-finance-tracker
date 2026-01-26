import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard/dashboard';

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
    component: Register
  },
  
  // Protected routes
  {
    path: 'dashboard',
    component: Dashboard
    // canActivate: [authGuard] // Enable when ready
  },
  
  // Fallback - redirect to landing
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];