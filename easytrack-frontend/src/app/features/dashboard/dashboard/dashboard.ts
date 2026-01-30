import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth';  
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { HeaderComponent } from '../components/header/header';
import { Overview } from '../components/overview/overview';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user.model';

/*
interface User {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
}*/
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,
    SidebarComponent,
    HeaderComponent,
    Overview,
    ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  sidebarOpen: boolean = true;
  activeView: 'overview' | 'transactions' | 'budget' = 'overview';
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    if (this.isBrowser) {
      this.checkScreenSize();
      this.setupResizeListener();
    }
  }

  private checkScreenSize(): void {
    if (!this.isBrowser) return;
    
    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  private setupResizeListener(): void {
    if (!this.isBrowser) return;
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogout() {
    this.authService.logout();
  }

  changeView(view: 'overview' | 'transactions' | 'budget') {
    this.activeView = view;
    
    if (this.isBrowser && window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.checkScreenSize);
    }
  }
}
