import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Budget } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Budget[]> {
    return this.api.get<Budget[]>('budgets');
  }

  getActive(): Observable<Budget[]> {
    return this.api.get<Budget[]>('budgets/active');
  }

  getCurrent(): Observable<Budget[]> {
    return this.api.get<Budget[]>('budgets/current');
  }

  getProgress(id: number): Observable<number> {
    return this.api.get<number>(`budgets/${id}/progress`);
  }

  getById(id: number): Observable<Budget> {
    return this.api.get<Budget>(`budgets/${id}`);
  }

  create(budget: Budget): Observable<Budget> {
    return this.api.post<Budget>('budgets', budget);
  }

  update(id: number, budget: Budget): Observable<Budget> {
    return this.api.put<Budget>(`budgets/${id}`, budget);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`budgets/${id}`);
  }

  refresh(): Observable<void> {
    return this.api.post<void>('budgets/refresh', {});
  }
}