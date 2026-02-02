import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction, TransactionFilter, TransactionService } from '../../../../core/services/transaction';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = true;
  isUploading: boolean = false;
  errorMessage: string = '';
  
  // Filter state
  filter: TransactionFilter = {
    searchTerm: '',
    type: 'all',
    category: 'all',
    dateRange: 'month',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    size: 20
  };

  // Categories
  categories: string[] = [
    'All Categories',
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Housing',
    'Personal Care',
    'Savings',
    'Income',
    'Other'
  ];

  // Pagination
  totalCount: number = 0;
  totalPages: number = 1;
  currentPage: number = 1;

  // Summary
  totalIncome: number = 0;
  totalExpenses: number = 0;
  netAmount: number = 0;

  // Page size options
  pageSizeOptions: number[] = [10, 20, 50, 100];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  /**
   * Load transactions from API
   */
  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService.getTransactions(this.filter).subscribe({
      next: (response) => {
        this.transactions = response.transactions;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.isLoading = false;
        this.loadSummary();
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.error('Error loading transactions:', error);
      }
    });
  }

  /**
   * Load transaction summary
   */
  loadSummary(): void {
    this.transactionService.getTransactionSummary(this.filter.dateRange).subscribe({
      next: (summary) => {
        this.totalIncome = summary.totalIncome;
        this.totalExpenses = summary.totalExpenses;
        this.netAmount = summary.netAmount;
      },
      error: (error) => {
        console.error('Error loading summary:', error);
        this.calculateSummaryFromTransactions();
      }
    });
  }

  /**
   * Fallback: Calculate summary from loaded transactions
   */
  private calculateSummaryFromTransactions(): void {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.netAmount = this.totalIncome - this.totalExpenses;
  }

  /**
   * Load categories from API
   */
  loadCategories(): void {
    this.transactionService.getCategories().subscribe({
      next: (categories) => {
        this.categories = ['All Categories', ...categories];
      },
      error: (error) => {
        console.log('Using default categories:', error.message);
      }
    });
  }

  /**
   * Apply filters and reload
   */
  applyFilters(): void {
    this.filter.page = 1;
    this.loadTransactions();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filter = {
      searchTerm: '',
      type: 'all',
      category: 'all',
      dateRange: 'month',
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1,
      size: this.filter.size
    };
    this.loadTransactions();
  }

  /**
   * Pagination methods - FIXED NAMES
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.filter.page = this.currentPage + 1;
      this.loadTransactions();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.filter.page = this.currentPage - 1;
      this.loadTransactions();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.filter.page = page;
      this.loadTransactions();
    }
  }

  // FIXED: Changed from changePage to changePageSize
  changePageSize(size: number): void {
    this.filter.size = size;
    this.filter.page = 1;
    this.loadTransactions();
  }

  /**
   * CSV Upload
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadCSV(file);
    }
  }

  private uploadCSV(file: File): void {
    this.isUploading = true;
    this.errorMessage = '';

    this.transactionService.uploadCSV(file).subscribe({
      next: (result) => {
        this.isUploading = false;
        alert(`Successfully imported ${result.imported} transactions. ${result.failed} failed.`);
        this.loadTransactions();
      },
      error: (error) => {
        this.isUploading = false;
        this.errorMessage = error.message;
        alert(`Failed to upload CSV: ${error.message}`);
      }
    });
  }

  triggerFileUpload(): void {
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Export to CSV
   */
  exportToCSV(): void {
    this.transactionService.exportToCSV(this.filter).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        alert(`Failed to export: ${error.message}`);
      }
    });
  }

  /**
   * Delete transaction
   */
  deleteTransaction(transaction: Transaction): void {
    if (!confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
      return;
    }

    this.transactionService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        alert('Transaction deleted successfully');
        this.loadTransactions();
      },
      error: (error) => {
        alert(`Failed to delete: ${error.message}`);
      }
    });
  }

  /**
   * Edit transaction
   */
  editTransaction(transaction: Transaction): void {
    console.log('Edit transaction:', transaction);
    alert('Edit functionality coming soon!');
  }

  /**
   * Track by for performance
   */
  trackByTransactionId(index: number, transaction: Transaction): string {
    return transaction.id;
  }

  /**
   * Helper methods
   */
  getTotalIncome(): number {
    return this.totalIncome;
  }

  getTotalExpenses(): number {
    return this.totalExpenses;
  }

  getNetAmount(): number {
    return this.netAmount;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}