
export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT_CARD = 'CREDIT_CARD',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT'
}

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  active: boolean;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}