// src/app/core/models/transaction.model.ts
import { Account } from './account.model';
import { Category } from './category.model';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  accountId: number;
  categoryId: number;
  userId?: number;
  account?: Account;
  category?: Category;
  createdAt?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
}