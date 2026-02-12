import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Preferences {
  currency: string;
  dateFormat: string;
  theme: string;
  language: string;
  startOfWeek: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Security {
  twoFactorEnabled: boolean;
}

interface Notifications {
  email: {
    transactions: boolean;
    budgets: boolean;
    weeklySummary: boolean;
  };
  push: {
    largeTransactions: boolean;
    billReminders: boolean;
  };
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab: string = 'profile';
  isSaving: boolean = false;
  profilePictureUrl: string = '';

  profile: Profile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+27 123 456 7890'
  };

  preferences: Preferences = {
    currency: 'ZAR',
    dateFormat: 'DD/MM/YYYY',
    theme: 'dark',
    language: 'en',
    startOfWeek: 'monday'
  };

  passwordData: PasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  security: Security = {
    twoFactorEnabled: false
  };

  notifications: Notifications = {
    email: {
      transactions: true,
      budgets: true,
      weeklySummary: false
    },
    push: {
      largeTransactions: true,
      billReminders: true
    }
  };

  activeSessions: Session[] = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Johannesburg, South Africa',
      lastActive: '2 minutes ago'
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Johannesburg, South Africa',
      lastActive: '2 hours ago'
    }
  ];

  constructor(
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Load user data from service
   */
  loadUserData(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.profile.firstName = user.firstName || 'John';
      this.profile.lastName = user.lastName || 'Doe';
      this.profile.email = user.email || 'john.doe@example.com';
      this.profile.phone = user.phone || '';
    }

    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      this.preferences = { ...this.preferences, ...JSON.parse(storedPreferences) };
    }

    const storedNotifications = localStorage.getItem('notificationSettings');
    if (storedNotifications) {
      this.notifications = { ...this.notifications, ...JSON.parse(storedNotifications) };
    }

    const storedPicture = localStorage.getItem('profilePictureUrl');
    if (storedPicture) {
      this.profilePictureUrl = storedPicture;
    }
  }

  getInitials(): string {
    return `${this.profile.firstName.charAt(0)}${this.profile.lastName.charAt(0)}`.toUpperCase();
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onProfilePictureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('Image must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result;
        localStorage.setItem('profilePictureUrl', this.profilePictureUrl);
        this.toastService.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePicture(): void {
    this.profilePictureUrl = '';
    localStorage.removeItem('profilePictureUrl');
    this.toastService.info('Profile picture removed');
  }

  saveProfile(): void {
    this.isSaving = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profile.email)) {
      this.toastService.error('Please enter a valid email address');
      this.isSaving = false;
      return;
    }

    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.firstName = this.profile.firstName;
      currentUser.lastName = this.profile.lastName;
      currentUser.email = this.profile.email;
      currentUser.phone = this.profile.phone;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      this.isSaving = false;
      this.toastService.success('Profile updated successfully!');
    }, 1000);
  }

  resetProfile(): void {
    this.loadUserData();
    this.toastService.info('Changes discarded');
  }

  savePreferences(): void {
    this.isSaving = true;
    localStorage.setItem('userPreferences', JSON.stringify(this.preferences));

    setTimeout(() => {
      this.isSaving = false;
      this.toastService.success('Preferences saved successfully!');
      
      if (this.preferences.theme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }, 1000);
  }

  changePassword(): void {
    if (!this.passwordData.currentPassword) {
      this.toastService.error('Current password is required');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.toastService.error('Password must be at least 8 characters');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastService.error('New passwords do not match');
      return;
    }

    this.isSaving = true;

    setTimeout(() => {
      this.isSaving = false;
      this.toastService.success('Password changed successfully!');
      
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }, 1000);
  }

  toggleTwoFactor(): void {
    if (this.security.twoFactorEnabled) {
      this.toastService.info('Two-factor authentication enabled!');
    } else {
      this.toastService.warning('Two-factor authentication disabled');
    }
  }

  revokeSession(sessionId: string): void {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
    this.toastService.success('Session revoked successfully!');
  }

  saveNotifications(): void {
    this.isSaving = true;
    localStorage.setItem('notificationSettings', JSON.stringify(this.notifications));

    setTimeout(() => {
      this.isSaving = false;
      this.toastService.success('Notification settings saved!');
    }, 1000);
  }

  exportAllData(): void {
    this.toastService.info('Preparing your data export...');
    
    setTimeout(() => {
      this.toastService.success('Data export complete!');
    }, 2000);
  }

  deleteAccount(): void {
    const confirmation = prompt('Type "DELETE" to confirm:');
    
    if (confirmation !== 'DELETE') {
      this.toastService.warning('Account deletion cancelled');
      return;
    }

    if (!confirm('This action cannot be undone. Continue?')) {
      return;
    }

    this.toastService.warning('Deleting account...');
    
    setTimeout(() => {
      this.toastService.error('Account deleted. Logging out...');
      
      setTimeout(() => {
        localStorage.clear();
        this.router.navigate(['/login']);
      }, 2000);
    }, 1000);
  }
}