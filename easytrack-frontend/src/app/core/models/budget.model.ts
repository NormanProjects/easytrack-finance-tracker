import { Category } from './category.model';

export enum BudgetPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface Budget {
  id?: number;
  categoryId: number;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  isActive: boolean;
  userId?: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetProgress {
  budgetId: number;
  percentage: number;
  remaining: number;
}