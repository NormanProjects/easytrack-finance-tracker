import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth';   
//
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { Header } from '../components/header/header';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CommonModule,
    SidebarComponent,
    Header,
    ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
currentUser: User | null = null;
  sidebarOpen: boolean = true;
  activeView: 'overview' | 'transactions' | 'budget' = 'overview';

  constructor(
    private authService: AuthService  ) {}

  ngOnInit() {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Check screen size and close sidebar on mobile
    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogout() {
    this.authService.logout();
  }

  changeView(view: 'overview' | 'transactions' | 'budget') {
    this.activeView = view;
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }
}
