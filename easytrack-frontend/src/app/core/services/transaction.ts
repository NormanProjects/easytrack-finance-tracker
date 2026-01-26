
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Transaction, TransactionSummary } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Transaction[]> {
    return this.api.get<Transaction[]>('transactions');
  }

  getByDateRange(startDate: string, endDate: string): Observable<Transaction[]> {
    return this.api.get<Transaction[]>('transactions/date-range', { startDate, endDate });
  }

  getById(id: number): Observable<Transaction> {
    return this.api.get<Transaction>(`transactions/${id}`);
  }

  create(transaction: Transaction): Observable<Transaction> {
    return this.api.post<Transaction>('transactions', transaction);
  }

  update(id: number, transaction: Transaction): Observable<Transaction> {
    return this.api.put<Transaction>(`transactions/${id}`, transaction);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`transactions/${id}`);
  }

  getSummary(startDate: string, endDate: string): Observable<TransactionSummary> {
    return this.api.get<TransactionSummary>('transactions/summary', { startDate, endDate });
  }
}