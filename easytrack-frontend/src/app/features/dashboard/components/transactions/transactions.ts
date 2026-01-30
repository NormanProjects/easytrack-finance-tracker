import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Transaction {
  id: string;
  description: string;
  notes?: string;
  category: string;
  account: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class TransactionsComponent implements OnInit {
  // Data
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  
  // Filter state
  searchQuery: string = '';
  filterType: 'all' | 'income' | 'expense' = 'all';
  filterCategory: string = 'all';
  filterPeriod: string = 'all';
  
  // Sorting
  sortColumn: 'date' | 'description' | 'amount' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 25;
  
  // Selection
  selectedTransactions: Set<string> = new Set();
  
  // Loading state
  isLoading: boolean = true;
  
  // Categories list
  categories: string[] = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Salary',
    'Freelance',
    'Investment',
    'Other'
  ];

  ngOnInit() {
    this.loadTransactions();
  }

  private loadTransactions() {
    // Simulate API call with mock data
    setTimeout(() => {
      this.transactions = this.generateMockTransactions();
      this.applyFilters();
      this.isLoading = false;
    }, 500);
  }

  private generateMockTransactions(): Transaction[] {
    const mockData: Transaction[] = [
      {
        id: '1',
        description: 'Monthly Salary',
        category: 'Salary',
        account: 'Bank Account',
        amount: 25000,
        type: 'income',
        date: new Date('2026-01-28')
      },
      {
        id: '2',
        description: 'Woolworths Grocery',
        notes: 'Weekly groceries',
        category: 'Food & Dining',
        account: 'Credit Card',
        amount: 1250.50,
        type: 'expense',
        date: new Date('2026-01-27')
      },
      {
        id: '3',
        description: 'Uber Ride',
        category: 'Transportation',
        account: 'Credit Card',
        amount: 85.00,
        type: 'expense',
        date: new Date('2026-01-26')
      },
      {
        id: '4',
        description: 'Freelance Project',
        notes: 'Website development',
        category: 'Freelance',
        account: 'Bank Account',
        amount: 5500,
        type: 'income',
        date: new Date('2026-01-25')
      },
      {
        id: '5',
        description: 'Netflix Subscription',
        category: 'Entertainment',
        account: 'Credit Card',
        amount: 199,
        type: 'expense',
        date: new Date('2026-01-24')
      },
      {
        id: '6',
        description: 'Electricity Bill',
        category: 'Bills & Utilities',
        account: 'Bank Account',
        amount: 850,
        type: 'expense',
        date: new Date('2026-01-23')
      },
      {
        id: '7',
        description: 'Pick n Pay',
        category: 'Food & Dining',
        account: 'Debit Card',
        amount: 450,
        type: 'expense',
        date: new Date('2026-01-22')
      },
      {
        id: '8',
        description: 'Gym Membership',
        category: 'Healthcare',
        account: 'Credit Card',
        amount: 599,
        type: 'expense',
        date: new Date('2026-01-21')
      },
      {
        id: '9',
        description: 'Dividend Payment',
        category: 'Investment',
        account: 'Investment Account',
        amount: 1200,
        type: 'income',
        date: new Date('2026-01-20')
      },
      {
        id: '10',
        description: 'Takealot Purchase',
        notes: 'Books and electronics',
        category: 'Shopping',
        account: 'Credit Card',
        amount: 2450,
        type: 'expense',
        date: new Date('2026-01-19')
      },
      {
        id: '11',
        description: 'Restaurants',
        category: 'Food & Dining',
        account: 'Credit Card',
        amount: 380,
        type: 'expense',
        date: new Date('2026-01-18')
      },
      {
        id: '12',
        description: 'Petrol',
        category: 'Transportation',
        account: 'Credit Card',
        amount: 850,
        type: 'expense',
        date: new Date('2026-01-17')
      }
    ];

    return mockData;
  }

  // Search and Filter
  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.onSearchChange();
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterType = 'all';
    this.filterCategory = 'all';
    this.filterPeriod = 'all';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.filterType !== 'all' || 
           this.filterCategory !== 'all' || 
           this.filterPeriod !== 'all';
  }

  private applyFilters() {
    let filtered = [...this.transactions];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.account.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (this.filterType !== 'all') {
      filtered = filtered.filter(t => t.type === this.filterType);
    }

    // Category filter
    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.filterCategory);
    }

    // Period filter
    if (this.filterPeriod !== 'all') {
      filtered = this.filterByPeriod(filtered, this.filterPeriod);
    }

    this.filteredTransactions = filtered;
    this.sortTransactions();
    this.updatePagination();
  }

  private filterByPeriod(transactions: Transaction[], period: string): Transaction[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case 'today':
        return transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= today;
        });
      
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return transactions.filter(t => new Date(t.date) >= weekAgo);
      
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return transactions.filter(t => new Date(t.date) >= monthAgo);
      
      case 'quarter':
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return transactions.filter(t => new Date(t.date) >= quarterAgo);
      
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return transactions.filter(t => new Date(t.date) >= yearAgo);
      
      default:
        return transactions;
    }
  }

  // Sorting
  sortBy(column: 'date' | 'description' | 'amount') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = column === 'date' ? 'desc' : 'asc';
    }
    this.sortTransactions();
    this.updatePagination();
  }

  private sortTransactions() {
    this.filteredTransactions.sort((a, b) => {
      let comparison = 0;

      switch (this.sortColumn) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Pagination
  private updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.pageSize);
  }

  getPageStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getPageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredTransactions.length);
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  // Calculations
  calculateTotalIncome(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  calculateTotalExpenses(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  calculateNetAmount(): number {
    return this.calculateTotalIncome() - this.calculateTotalExpenses();
  }

  getNetAmountClass(): string {
    const net = this.calculateNetAmount();
    return net >= 0 ? 'positive' : 'negative';
  }

  // Actions
  openAddTransaction() {
    // TODO: Open modal or navigate to add transaction page
    console.log('Open add transaction modal');
  }

  editTransaction(transaction: Transaction) {
    // TODO: Open edit modal
    console.log('Edit transaction:', transaction);
  }

  deleteTransaction(transaction: Transaction) {
    // TODO: Show confirmation dialog
    if (confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
      this.transactions = this.transactions.filter(t => t.id !== transaction.id);
      this.applyFilters();
      console.log('Deleted transaction:', transaction);
    }
  }

  exportTransactions() {
    // TODO: Implement CSV export
    console.log('Export transactions to CSV');
    
    // Simple CSV export example
    const csv = this.generateCSV(this.filteredTransactions);
    this.downloadCSV(csv, 'transactions.csv');
  }

  private generateCSV(transactions: Transaction[]): string {
    const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'];
    const rows = transactions.map(t => [
      t.date.toISOString().split('T')[0],
      t.description,
      t.category,
      t.account,
      t.type,
      t.amount.toString()
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  private downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Track by for performance
  trackByTransactionId(index: number, transaction: Transaction): string {
    return transaction.id;
  }
}