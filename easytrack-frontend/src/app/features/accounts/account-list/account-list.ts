import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Account, AccountType } from '../../../core/models/account.model';
import { AccountService } from '../../../core/services/account';

@Component({
  selector: 'app-account-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-list.html',
  styleUrl: './account-list.css',
})
export class AccountsListComponent implements OnInit {
  accounts: Account[] = [];
  totalBalance: number = 0;
  isLoading: boolean = false;
  showForm: boolean = false;
  editingAccount: Account | null = null;

  // Form data
  accountForm: Account = this.getEmptyAccount();
  accountTypes = Object.values(AccountType);

  constructor(
    private accountService: AccountService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadTotalBalance();
  }

  /**
   * Load all accounts
   */
  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAll().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.isLoading = false;
        this.showError('Failed to load accounts');
      }
    });
  }

  /**
   * Load total balance
   */
  loadTotalBalance(): void {
    this.accountService.getTotalBalance().subscribe({
      next: (balance) => {
        this.totalBalance = balance;
      },
      error: (error) => {
        console.error('Error loading total balance:', error);
      }
    });
  }

  /**
   * Open form for new account
   */
  openNewAccountForm(): void {
    this.editingAccount = null;
    this.accountForm = this.getEmptyAccount();
    this.showForm = true;
  }

  /**
   * Open form for editing account
   */
  editAccount(account: Account): void {
    this.editingAccount = account;
    this.accountForm = { ...account };
    this.showForm = true;
  }

  /**
   * Save account (create or update)
   */
  saveAccount(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    if (this.editingAccount && this.editingAccount.id) {
      // Update existing account
      this.accountService.update(this.editingAccount.id, this.accountForm).subscribe({
        next: () => {
          this.showSuccess('Account updated successfully');
          this.closeForm();
          this.loadAccounts();
          this.loadTotalBalance();
        },
        error: (error) => {
          console.error('Error updating account:', error);
          this.showError('Failed to update account');
          this.isLoading = false;
        }
      });
    } else {
      // Create new account
      this.accountService.create(this.accountForm).subscribe({
        next: () => {
          this.showSuccess('Account created successfully');
          this.closeForm();
          this.loadAccounts();
          this.loadTotalBalance();
        },
        error: (error) => {
          console.error('Error creating account:', error);
          this.showError('Failed to create account');
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Delete account
   */
  deleteAccount(account: Account): void {
    if (!account.id) return;

    if (!confirm(`Are you sure you want to delete "${account.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this.accountService.delete(account.id).subscribe({
      next: () => {
        this.showSuccess('Account deleted successfully');
        this.loadAccounts();
        this.loadTotalBalance();
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        this.showError('Failed to delete account');
        this.isLoading = false;
      }
    });
  }

  /**
   * Close form
   */
  closeForm(): void {
    this.showForm = false;
    this.editingAccount = null;
    this.accountForm = this.getEmptyAccount();
  }

  /**
   * Validate form
   */
  validateForm(): boolean {
    if (!this.accountForm.name || this.accountForm.name.trim() === '') {
      this.showError('Account name is required');
      return false;
    }

    if (!this.accountForm.type) {
      this.showError('Account type is required');
      return false;
    }

    if (this.accountForm.balance === null || this.accountForm.balance === undefined) {
      this.showError('Initial balance is required');
      return false;
    }

    return true;
  }

  /**
   * Get empty account object
   */
  getEmptyAccount(): Account {
    return {
      name: '',
      type: AccountType.BANK,
      balance: 0,
      currency: 'ZAR',
      active: true
    };
  }

  /**
   * Get account icon
   */
  getAccountIcon(type: AccountType): string {
    const icons: { [key in AccountType]: string } = {
      [AccountType.CASH]: '💵',
      [AccountType.BANK]: '🏦',
      [AccountType.CREDIT_CARD]: '💳',
      [AccountType.SAVINGS]: '🏦',
      [AccountType.INVESTMENT]: '📈'
    };
    return icons[type] || '💰';
  }

  /**
   * Format account type for display
   */
  formatAccountType(type: AccountType): string {
    return type.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      alert(message); // Replace with toast notification
    }
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      alert(message); // Replace with toast notification
    }
  }
}