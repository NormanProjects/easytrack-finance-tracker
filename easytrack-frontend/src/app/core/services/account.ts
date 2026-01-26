// src/app/core/services/account.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Account[]> {
    return this.api.get<Account[]>('accounts');
  }

  getActive(): Observable<Account[]> {
    return this.api.get<Account[]>('accounts/active');
  }

  getById(id: number): Observable<Account> {
    return this.api.get<Account>(`accounts/${id}`);
  }

  create(account: Account): Observable<Account> {
    return this.api.post<Account>('accounts', account);
  }

  update(id: number, account: Account): Observable<Account> {
    return this.api.put<Account>(`accounts/${id}`, account);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`accounts/${id}`);
  }

  getTotalBalance(): Observable<number> {
    return this.api.get<number>('accounts/total-balance');
  }
}