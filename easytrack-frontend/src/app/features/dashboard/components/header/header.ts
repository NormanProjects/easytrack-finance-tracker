import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  
  @Input() user: User | null = null;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  searchQuery: string = '';
  userMenuOpen: boolean = false;
  notificationsOpen: boolean = false;
  notificationCount: number = 3;

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    this.notificationsOpen = false;
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    this.userMenuOpen = false;
  }

  onLogout() {
    this.logout.emit();
  }

  getUserInitials(): string {
    // CRITICAL FIX: Check if user exists first!
    if (!this.user || !this.user.name) {
      return 'U';  // Default fallback when user is null or has no name
    }
    
    const names = this.user.name.split(' ').filter(n => n.length > 0);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.user.name[0].toUpperCase();
  }

  getUserName(): string {
    return this.user?.name || 'User';
  }

  getUserEmail(): string {
    return this.user?.email || 'user@example.com';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu') && !target.closest('.header-icon-button')) {
      this.userMenuOpen = false;
      this.notificationsOpen = false;
    }
  }
}