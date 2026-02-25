export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Category {
  id?: number;
  userId?: number;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}