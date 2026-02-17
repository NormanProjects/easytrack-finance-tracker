import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Transaction {
  accountId: number;
  categoryId: number;
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  account?: string; 
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
}

export interface TransactionFilter {
  searchTerm?: string;
  type?: 'all' | 'income' | 'expense';
  category?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy?: 'date' | 'amount' | 'category';
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

export interface CreateTransactionRequest {
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  account?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  update(id: string, formData: Transaction) {
    throw new Error('Method not implemented.');
  }
  create(formData: Transaction) {
    throw new Error('Method not implemented.');
  }
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  /**
   * Get all transactions with filters - REAL API CALL
   */
  getTransactions(filter?: TransactionFilter): Observable<TransactionResponse> {
    let params = new HttpParams();

    if (filter) {
      if (filter.searchTerm) params = params.set('search', filter.searchTerm);
      if (filter.type && filter.type !== 'all') params = params.set('type', filter.type);
      if (filter.category && filter.category !== 'all') params = params.set('category', filter.category);
      if (filter.dateRange && filter.dateRange !== 'all') params = params.set('dateRange', filter.dateRange);
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.size) params = params.set('size', filter.size.toString());
    }

    return this.http.get<TransactionResponse>(this.API_URL, { params })
      .pipe(
        map(response => ({
          ...response,
          transactions: response.transactions.map(t => ({
            ...t,
            date: new Date(t.date) // Convert string to Date
          }))
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Get single transaction by ID - REAL API CALL
   */
  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API_URL}/${id}`)
      .pipe(
        map(t => ({
          ...t,
          date: new Date(t.date)
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Create new transaction - REAL API CALL
   */
  createTransaction(transaction: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.API_URL, transaction)
      .pipe(
        map(t => ({
          ...t,
          date: new Date(t.date)
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Update transaction - REAL API CALL
   */
  updateTransaction(id: string, transaction: Partial<CreateTransactionRequest>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.API_URL}/${id}`, transaction)
      .pipe(
        map(t => ({
          ...t,
          date: new Date(t.date)
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Delete transaction - REAL API CALL
   */
  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Upload CSV file - REAL API CALL
   */
  uploadCSV(file: File): Observable<{ imported: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imported: number; failed: number }>(
      `${this.API_URL}/import/csv`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Export transactions to CSV - REAL API CALL
   */
  exportToCSV(filter?: TransactionFilter): Observable<Blob> {
    let params = new HttpParams();

    if (filter) {
      if (filter.searchTerm) params = params.set('search', filter.searchTerm);
      if (filter.type && filter.type !== 'all') params = params.set('type', filter.type);
      if (filter.category && filter.category !== 'all') params = params.set('category', filter.category);
      if (filter.dateRange && filter.dateRange !== 'all') params = params.set('dateRange', filter.dateRange);
    }

    return this.http.get(`${this.API_URL}/export/csv`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get transaction summary/stats - REAL API CALL
   */
  getTransactionSummary(dateRange?: string): Observable<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
  }> {
    let params = new HttpParams();
    if (dateRange) params = params.set('dateRange', dateRange);

    return this.http.get<{
      totalIncome: number;
      totalExpenses: number;
      netAmount: number;
      transactionCount: number;
    }>(`${this.API_URL}/summary`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get categories - REAL API CALL
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/categories`)
      .pipe(
        catchError(() => {
          // Fallback to default categories if endpoint doesn't exist
          return throwError(() => new Error('Categories endpoint not available'));
        })
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 404) {
        errorMessage = 'Transaction not found';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request';
      } else if (error.status === 0) {
        errorMessage = 'Cannot connect to server';
      } else {
        errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }

    console.error('Transaction Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}