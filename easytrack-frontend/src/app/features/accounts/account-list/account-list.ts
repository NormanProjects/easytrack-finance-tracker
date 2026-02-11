import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account, AccountType } from '../../../core/models/account.model';
import { AccountService } from '../../../core/services/account';

@Component({
  selector: 'app-account-list',
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './account-list.html',
  styleUrl: './account-list.css',
})
export class AccountsListComponent implements OnInit {
  accounts: Account[] = [];
  totalBalance: number = 0;
  totalAssets: number = 0;
  totalLiabilities: number = 0;
  isLoading: boolean = false;
  showForm: boolean = false;
  editingAccount: Account | null = null;

  // Form data
  accountForm: Account = this.getEmptyAccount();
  
  // Account types with metadata
  AccountType = AccountType;
  accountTypes = [
    { 
      value: AccountType.CASH, 
      label: 'Cash', 
      icon: '💵',
      description: 'Physical cash and petty cash',
      isAsset: true
    },
    { 
      value: AccountType.BANK, 
      label: 'Bank Account', 
      icon: '🏦',
      description: 'Checking and savings accounts',
      isAsset: true
    },
    { 
      value: AccountType.CREDIT_CARD, 
      label: 'Credit Card', 
      icon: '💳',
      description: 'Credit card balances',
      isAsset: false
    },
    { 
      value: AccountType.SAVINGS, 
      label: 'Savings', 
      icon: '🏦',
      description: 'High-yield savings accounts',
      isAsset: true
    },
    { 
      value: AccountType.INVESTMENT, 
      label: 'Investment', 
      icon: '📈',
      description: 'Stocks, bonds, and portfolios',
      isAsset: true
    }
  ];

  // Available currencies
  currencies = [
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  // Expose Math for template
  Math = Math;

  constructor(
    private accountService: AccountService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  /**
   * Load all accounts and calculate totals
   */
  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAll().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.calculateTotals();
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
   * Calculate total balance, assets, and liabilities
   */
  calculateTotals(): void {
    this.totalAssets = 0;
    this.totalLiabilities = 0;

    this.accounts.forEach(account => {
      if (account.active) {
        if (account.type === AccountType.CREDIT_CARD) {
          // Credit cards are liabilities (negative balance)
          this.totalLiabilities += Math.abs(account.balance);
        } else {
          // All other accounts are assets
          this.totalAssets += account.balance;
        }
      }
    });

    this.totalBalance = this.totalAssets - this.totalLiabilities;
  }

  /**
   * Get accounts grouped by type
   */
  getAssetAccounts(): Account[] {
    return this.accounts.filter(a => 
      a.type !== AccountType.CREDIT_CARD && a.active
    );
  }

  getLiabilityAccounts(): Account[] {
    return this.accounts.filter(a => 
      a.type === AccountType.CREDIT_CARD && a.active
    );
  }

  getInactiveAccounts(): Account[] {
    return this.accounts.filter(a => !a.active);
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

    if (!confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
      return;
    }

    this.isLoading = true;
    this.accountService.delete(account.id).subscribe({
      next: () => {
        this.showSuccess('Account deleted successfully');
        this.loadAccounts();
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        this.showError('Failed to delete account');
        this.isLoading = false;
      }
    });
  }

  /**
   * Toggle account active status
   */
  toggleAccountStatus(account: Account): void {
    if (!account.id) return;

    const updatedAccount = { ...account, active: !account.active };
    
    this.accountService.update(account.id, updatedAccount).subscribe({
      next: () => {
        this.showSuccess(`Account ${updatedAccount.active ? 'activated' : 'deactivated'}`);
        this.loadAccounts();
      },
      error: (error) => {
        console.error('Error toggling account status:', error);
        this.showError('Failed to update account status');
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
      this.showError('Balance is required');
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
   * Get account type metadata
   */
  getAccountTypeMetadata(type: AccountType) {
    return this.accountTypes.find(t => t.value === type);
  }

  /**
   * Format currency
   */
  getCurrencySymbol(code: string): string {
    const currency = this.currencies.find(c => c.code === code);
    return currency ? currency.symbol : 'R';
  }

  /**
   * Get balance color class
   */
  getBalanceClass(account: Account): string {
    if (account.type === AccountType.CREDIT_CARD) {
      return account.balance >= 0 ? 'positive' : 'negative';
    }
    return account.balance >= 0 ? 'positive' : 'negative';
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