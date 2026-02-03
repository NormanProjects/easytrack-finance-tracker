import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Load user data from service
   */
  loadUserData(): void {
    // TODO: Load from auth service
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.profile.firstName = user.firstName || 'John';
      this.profile.lastName = user.lastName || 'Doe';
      this.profile.email = user.email || 'john.doe@example.com';
    }

    // Load preferences from localStorage
    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      this.preferences = { ...this.preferences, ...JSON.parse(storedPreferences) };
    }
  }

  /**
   * Get initials for avatar placeholder
   */
  getInitials(): string {
    return `${this.profile.firstName.charAt(0)}${this.profile.lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Trigger file upload
   */
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handle profile picture change
   */
  onProfilePictureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // TODO: Upload to server
      console.log('Uploading profile picture:', file);
    }
  }

  /**
   * Remove profile picture
   */
  removeProfilePicture(): void {
    this.profilePictureUrl = '';
    // TODO: Remove from server
  }

  /**
   * Save profile changes
   */
  saveProfile(): void {
    this.isSaving = true;

    // TODO: Call API to update profile
    setTimeout(() => {
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.firstName = this.profile.firstName;
      currentUser.lastName = this.profile.lastName;
      currentUser.email = this.profile.email;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      this.isSaving = false;
      this.showSuccessMessage('Profile updated successfully!');
    }, 1000);
  }

  /**
   * Reset profile form
   */
  resetProfile(): void {
    this.loadUserData();
  }

  /**
   * Save preferences
   */
  savePreferences(): void {
    this.isSaving = true;

    // Save to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(this.preferences));

    // TODO: Call API to save preferences
    setTimeout(() => {
      this.isSaving = false;
      this.showSuccessMessage('Preferences saved successfully!');
      
      // Apply theme if changed
      if (this.preferences.theme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }, 1000);
  }

  /**
   * Change password
   */
  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    this.isSaving = true;

    // TODO: Call API to change password
    setTimeout(() => {
      this.isSaving = false;
      this.showSuccessMessage('Password changed successfully!');
      
      // Clear form
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }, 1000);
  }

  /**
   * Toggle two-factor authentication
   */
  toggleTwoFactor(): void {
    if (this.security.twoFactorEnabled) {
      // TODO: Setup 2FA
      console.log('Setting up 2FA...');
      alert('Two-factor authentication setup will be implemented soon!');
    } else {
      // TODO: Disable 2FA
      console.log('Disabling 2FA...');
    }
  }

  /**
   * Revoke session
   */
  revokeSession(sessionId: string): void {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    // TODO: Call API to revoke session
    this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
    this.showSuccessMessage('Session revoked successfully!');
  }

  /**
   * Save notification settings
   */
  saveNotifications(): void {
    this.isSaving = true;

    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(this.notifications));

    // TODO: Call API to save notification settings
    setTimeout(() => {
      this.isSaving = false;
      this.showSuccessMessage('Notification settings saved!');
    }, 1000);
  }

  /**
   * Export all data
   */
  exportAllData(): void {
    // TODO: Call API to export data
    alert('Your data export has been initiated. You will receive an email with the download link shortly.');
    console.log('Exporting all user data...');
  }

  /**
   * Delete account
   */
  deleteAccount(): void {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    
    if (confirmation !== 'DELETE') {
      return;
    }

    if (!confirm('This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    // TODO: Call API to delete account
    alert('Account deletion initiated. You will be logged out shortly.');
    
    // Logout after delay
    setTimeout(() => {
      localStorage.clear();
      this.router.navigate(['/login']);
    }, 2000);
  }

  /**
   * Show success message
   */
  private showSuccessMessage(message: string): void {
    // TODO: Implement toast notification
    console.log('Success:', message);
    alert(message);
  }
}