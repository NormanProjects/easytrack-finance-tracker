import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Types and Interfaces
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  account?: string;
}

export interface TransactionFilter {
  searchTerm?: string;
  type?: string;
  category?: string;
  dateRange?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export interface CSVUploadResult {
  imported: number;
  failed: number;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = '/api/transactions'; // Replace with your actual API URL
  private readonly USE_MOCK_DATA = true; // Toggle for development

  constructor(private http: HttpClient) {}

  /**
   * Get transactions with filters and pagination
   */
  getTransactions(filter: TransactionFilter): Observable<TransactionResponse> {
    if (this.USE_MOCK_DATA) {
      return this.getMockTransactions(filter);
    }

    let params = new HttpParams();
    
    if (filter.searchTerm) params = params.set('search', filter.searchTerm);
    if (filter.type && filter.type !== 'all') params = params.set('type', filter.type);
    if (filter.category && filter.category !== 'All Categories') params = params.set('category', filter.category);
    if (filter.dateRange) params = params.set('dateRange', filter.dateRange);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.size) params = params.set('size', filter.size.toString());

    return this.http.get<TransactionResponse>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching transactions:', error);
        return this.getMockTransactions(filter);
      })
    );
  }

  /**
   * Get transaction summary
   */
  getTransactionSummary(dateRange?: string): Observable<TransactionSummary> {
    if (this.USE_MOCK_DATA) {
      return of({
        totalIncome: 328500,
        totalExpenses: 269000,
        netAmount: 59500
      });
    }

    let params = new HttpParams();
    if (dateRange) params = params.set('dateRange', dateRange);

    return this.http.get<TransactionSummary>(`${this.apiUrl}/summary`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching summary:', error);
        return of({ totalIncome: 0, totalExpenses: 0, netAmount: 0 });
      })
    );
  }

  /**
   * Get categories
   */
  getCategories(): Observable<string[]> {
    if (this.USE_MOCK_DATA) {
      return of([
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
      ]);
    }

    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }

  /**
   * Upload CSV file
   */
  uploadCSV(file: File): Observable<CSVUploadResult> {
    if (this.USE_MOCK_DATA) {
      return of({
        imported: 45,
        failed: 2,
        errors: ['Row 23: Invalid date format', 'Row 47: Missing amount']
      });
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<CSVUploadResult>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(error => {
        console.error('Error uploading CSV:', error);
        throw error;
      })
    );
  }

  /**
   * Export to CSV
   */
  exportToCSV(filter: TransactionFilter): Observable<Blob> {
    if (this.USE_MOCK_DATA) {
      // Generate mock CSV
      const csvContent = this.generateMockCSV();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      return of(blob);
    }

    let params = new HttpParams();
    if (filter.type && filter.type !== 'all') params = params.set('type', filter.type);
    if (filter.category && filter.category !== 'All Categories') params = params.set('category', filter.category);
    if (filter.dateRange) params = params.set('dateRange', filter.dateRange);

    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error exporting CSV:', error);
        throw error;
      })
    );
  }

  /**
   * Delete transaction
   */
  deleteTransaction(id: string): Observable<void> {
    if (this.USE_MOCK_DATA) {
      return of(void 0);
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting transaction:', error);
        throw error;
      })
    );
  }

  /**
   * Create transaction
   */
  createTransaction(transaction: Partial<Transaction>): Observable<Transaction> {
    if (this.USE_MOCK_DATA) {
      return of({
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
        status: 'completed'
      } as Transaction);
    }

    return this.http.post<Transaction>(this.apiUrl, transaction).pipe(
      catchError(error => {
        console.error('Error creating transaction:', error);
        throw error;
      })
    );
  }

  /**
   * Update transaction
   */
  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<Transaction> {
    if (this.USE_MOCK_DATA) {
      return of({ ...transaction, id } as Transaction);
    }

    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction).pipe(
      catchError(error => {
        console.error('Error updating transaction:', error);
        throw error;
      })
    );
  }

  // ============================================
  // MOCK DATA METHODS (for development/testing)
  // ============================================

  private getMockTransactions(filter: TransactionFilter): Observable<TransactionResponse> {
    const allTransactions = this.generateMockTransactionData();
    
    // Apply filters
    let filtered = allTransactions;
    
    if (filter.searchTerm) {
      const search = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search)
      );
    }
    
    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(t => t.type === filter.type);
    }
    
    if (filter.category && filter.category !== 'All Categories') {
      filtered = filtered.filter(t => t.category === filter.category);
    }
    
    // Sorting
    if (filter.sortBy === 'amount') {
      filtered.sort((a, b) => filter.sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount);
    } else if (filter.sortBy === 'date') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return filter.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    
    // Pagination
    const page = filter.page || 1;
    const size = filter.size || 20;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedTransactions = filtered.slice(startIndex, endIndex);
    
    return of({
      transactions: paginatedTransactions,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      currentPage: page
    });
  }

  private generateMockTransactionData(): Transaction[] {
    const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Income'];
    const descriptions: { [key: string]: string[] } = {
      'Food & Dining': ['Grocery Shopping', 'Restaurant', 'Coffee Shop', 'Food Delivery', 'Fast Food'],
      'Transportation': ['Gas Station', 'Uber Ride', 'Public Transport', 'Car Maintenance', 'Parking'],
      'Shopping': ['Clothing Store', 'Online Shopping', 'Electronics', 'Home Goods', 'Books'],
      'Entertainment': ['Movie Tickets', 'Streaming Service', 'Concert', 'Games', 'Sports Event'],
      'Bills & Utilities': ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Phone Bill', 'Insurance'],
      'Healthcare': ['Pharmacy', 'Doctor Visit', 'Gym Membership', 'Dental', 'Medical Test'],
      'Income': ['Salary', 'Freelance Payment', 'Investment Return', 'Bonus', 'Gift']
    };

    const transactions: Transaction[] = [];
    const now = new Date();

    for (let i = 0; i < 150; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const type = category === 'Income' ? 'income' : 'expense';
      const descList = descriptions[category];
      const description = descList[Math.floor(Math.random() * descList.length)];
      
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      transactions.push({
        id: `txn_${i + 1}`,
        description,
        amount: type === 'income' ? Math.floor(Math.random() * 50000) + 5000 : Math.floor(Math.random() * 5000) + 100,
        type,
        category,
        date,
        status: Math.random() > 0.05 ? 'completed' : (Math.random() > 0.5 ? 'pending' : 'failed'),
        account: Math.random() > 0.5 ? 'Checking Account' : 'Savings Account'
      });
    }

    return transactions;
  }

  private generateMockCSV(): string {
    const headers = 'Date,Description,Category,Type,Amount,Status\n';
    const transactions = this.generateMockTransactionData();
    const rows = transactions.map(t => 
      `${t.date.toISOString().split('T')[0]},${t.description},${t.category},${t.type},${t.amount},${t.status}`
    ).join('\n');
    
    return headers + rows;
  }
}