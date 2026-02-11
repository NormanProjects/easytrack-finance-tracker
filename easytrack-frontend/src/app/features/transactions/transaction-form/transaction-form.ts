import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account } from '../../../core/models/account.model';
import { Category, CategoryType } from '../../../core/models/category.model';
import { Transaction, TransactionService, CreateTransactionRequest } from '../../../core/services/transaction';
import { AccountService } from '../../../core/services/account';
import { CategoryService } from '../../../core/services/category';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css',
})
export class TransactionFormComponent implements OnInit {
  @Input() transaction: Transaction | null = null;
  @Input() show: boolean = false;
  @Output() showChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  // Form data matching CreateTransactionRequest
  formData = {
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    description: '',
    category: '',      // category string (not ID)
    notes: '',
    date: new Date(),
    account: '',       // account string (not ID)
    accountId: 0,      // Keep for dropdown binding
    categoryId: 0      // Keep for dropdown binding
  };

  accounts: Account[] = [];
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Transaction types for UI
  transactionTypes = [
    { value: 'income' as const, label: 'Income', icon: '💰', color: '#00FF94' },
    { value: 'expense' as const, label: 'Expense', icon: '💸', color: '#ef4444' }
  ];

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadCategories();
    
    if (this.transaction) {
      this.formData = {
        type: this.transaction.type,
        amount: this.transaction.amount,
        description: this.transaction.description,
        category: this.transaction.category,
        notes: this.transaction.notes || '',
        date: this.transaction.date,
        account: this.transaction.account || '',
        accountId: this.transaction.accountId,
        categoryId: this.transaction.categoryId
      };
      this.filterCategoriesByType();
    }
  }

  /**
   * Load accounts
   */
  loadAccounts(): void {
    this.accountService.getActive().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        
        // Set default account if creating new transaction
        if (!this.transaction && accounts.length > 0 && accounts[0].id) {
          this.formData.accountId = accounts[0].id;
          this.formData.account = accounts[0].name;
        }
      },
      error: (error: any) => {
        console.error('Error loading accounts:', error);
        this.showError('Failed to load accounts');
      }
    });
  }

  /**
   * Load categories
   */
  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filterCategoriesByType();
        
        // Set default category if creating new transaction
        if (!this.transaction && this.filteredCategories.length > 0 && this.filteredCategories[0].id) {
          this.formData.categoryId = this.filteredCategories[0].id;
          this.formData.category = this.filteredCategories[0].name;
        }
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.showError('Failed to load categories');
      }
    });
  }

  /**
   * Filter categories based on transaction type
   */
  filterCategoriesByType(): void {
    // Map string literal type to CategoryType enum
    const categoryType = this.formData.type === 'income' 
      ? CategoryType.INCOME 
      : CategoryType.EXPENSE;
    
    this.filteredCategories = this.categories.filter(c => c.type === categoryType);
    
    // Reset category if it doesn't match the new type
    const currentCategory = this.categories.find(c => c.id === this.formData.categoryId);
    if (currentCategory && currentCategory.type !== categoryType && this.filteredCategories.length > 0 && this.filteredCategories[0].id) {
      this.formData.categoryId = this.filteredCategories[0].id;
      this.formData.category = this.filteredCategories[0].name;
    }
  }

  /**
   * Handle transaction type change
   */
  onTypeChange(): void {
    this.filterCategoriesByType();
  }

  /**
   * Handle account selection change
   */
  onAccountChange(): void {
    const account = this.accounts.find(a => a.id === this.formData.accountId);
    if (account) {
      this.formData.account = account.name;
    }
  }

  /**
   * Handle category selection change
   */
  onCategoryChange(): void {
    const category = this.categories.find(c => c.id === this.formData.categoryId);
    if (category) {
      this.formData.category = category.name;
    }
  }

  /**
   * Save transaction
   */
  saveTransaction(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    // Create transaction data matching CreateTransactionRequest interface
    const transactionData: CreateTransactionRequest = {
      type: this.formData.type,
      amount: this.formData.amount,
      description: this.formData.description,
      category: this.formData.category,    // String, not ID
      date: this.formData.date,
      account: this.formData.account,      // String, not ID
      notes: this.formData.notes
    };

    let operation;
    if (this.transaction && this.transaction.id) {
      // Update existing transaction
      operation = this.transactionService.updateTransaction(this.transaction.id, transactionData);
    } else {
      // Create new transaction
      operation = this.transactionService.createTransaction(transactionData);
    }

    operation.subscribe({
      next: () => {
        this.showSuccess(this.transaction ? 'Transaction updated successfully' : 'Transaction created successfully');
        this.saved.emit();
        this.closeModal();
      },
      error: (error: any) => {
        console.error('Error saving transaction:', error);
        this.showError('Failed to save transaction');
        this.isSaving = false;
      }
    });
  }

  /**
   * Validate form
   */
  validateForm(): boolean {
    if (!this.formData.description || this.formData.description.trim() === '') {
      this.showError('Description is required');
      return false;
    }

    if (!this.formData.amount || this.formData.amount <= 0) {
      this.showError('Amount must be greater than 0');
      return false;
    }

    if (!this.formData.accountId) {
      this.showError('Please select an account');
      return false;
    }

    if (!this.formData.categoryId) {
      this.showError('Please select a category');
      return false;
    }

    if (!this.formData.date) {
      this.showError('Date is required');
      return false;
    }

    return true;
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.show = false;
    this.showChange.emit(false);
    this.resetForm();
    this.isSaving = false;
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.formData = {
      type: 'expense',
      amount: 0,
      description: '',
      category: '',
      notes: '',
      date: new Date(),
      account: '',
      accountId: 0,
      categoryId: 0
    };
  }

  /**
   * Get account name by ID
   */
  getAccountName(accountId: number): string {
    const account = this.accounts.find(a => a.id === accountId);
    return account ? account.name : '';
  }

  /**
   * Get category name by ID
   */
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  /**
   * Get selected type config
   */
  getSelectedTypeConfig() {
    return this.transactionTypes.find(t => t.value === this.formData.type) || this.transactionTypes[1];
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