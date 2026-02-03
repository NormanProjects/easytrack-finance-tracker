import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface RecentTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

interface Budget {
  category: string;
  spent: number;
  total: number;
  percentage: number;
}

interface Goal {
  name: string;
  icon: string;
  current: number;
  target: number;
  percentage: number;
  deadline: string;
}

export interface OverviewData {
  currentBalance: number;
  balanceChange: number;
  monthlyIncome: number;
  incomeGrowth: number;
  monthlyExpenses: number;
  expenseGrowth: number;
  totalSavings: number;
  savingsRate: number;
  largestExpense: number;
  avgDailySpending: number;
  activeBudgets: number;
  totalBudgets: number;
  transactionsThisMonth: number;
  recentTransactions: RecentTransaction[];
  budgets: Budget[];
  goals: Goal[];
}

@Injectable({
  providedIn: 'root'
})
export class OverviewService {
  private apiUrl = 'http://localhost:8080/api/dashboard'; // Spring Boot API
  private readonly USE_MOCK_DATA = false; // Set to true for development without backend

  constructor(private http: HttpClient) {}

  /**
   * Get overview/dashboard data
   */
  getOverviewData(): Observable<OverviewData> {
    if (this.USE_MOCK_DATA) {
      return this.getMockOverviewData();
    }

    // Call Spring Boot dashboard summary endpoint
    return this.http.get<any>(`${this.apiUrl}/summary`).pipe(
      catchError(error => {
        console.error('Error fetching overview data:', error);
        return this.getMockOverviewData();
      })
    );
  }

  /**
   * Get mock data for development
   */
  private getMockOverviewData(): Observable<OverviewData> {
    const mockData: OverviewData = {
      currentBalance: 145680,
      balanceChange: 12450,
      monthlyIncome: 75000,
      incomeGrowth: 8.5,
      monthlyExpenses: 52340,
      expenseGrowth: -3.2,
      totalSavings: 89500,
      savingsRate: 30.2,
      largestExpense: 15000,
      avgDailySpending: 1744.67,
      activeBudgets: 5,
      totalBudgets: 7,
      transactionsThisMonth: 124,
      recentTransactions: [
        {
          id: '1',
          description: 'Grocery Shopping',
          category: 'Food & Dining',
          amount: 1250,
          type: 'expense',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
          id: '2',
          description: 'Salary Deposit',
          category: 'Income',
          amount: 75000,
          type: 'income',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        },
        {
          id: '3',
          description: 'Electricity Bill',
          category: 'Bills & Utilities',
          amount: 2100,
          type: 'expense',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
        },
        {
          id: '4',
          description: 'Freelance Payment',
          category: 'Income',
          amount: 8500,
          type: 'income',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
        },
        {
          id: '5',
          description: 'Gas Station',
          category: 'Transportation',
          amount: 850,
          type: 'expense',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 days ago
        }
      ],
      budgets: [
        { category: 'Food & Dining', spent: 4200, total: 6000, percentage: 70 },
        { category: 'Transportation', spent: 2100, total: 3000, percentage: 70 },
        { category: 'Entertainment', spent: 1800, total: 2000, percentage: 90 },
        { category: 'Shopping', spent: 3200, total: 4000, percentage: 80 },
        { category: 'Bills & Utilities', spent: 5500, total: 6000, percentage: 92 }
      ],
      goals: [
        {
          name: 'Emergency Fund',
          icon: '🏦',
          current: 45000,
          target: 100000,
          percentage: 45,
          deadline: 'Dec 2024'
        },
        {
          name: 'Vacation Trip',
          icon: '✈️',
          current: 18000,
          target: 30000,
          percentage: 60,
          deadline: 'Jun 2024'
        },
        {
          name: 'New Car',
          icon: '🚗',
          current: 125000,
          target: 350000,
          percentage: 36,
          deadline: 'Mar 2025'
        }
      ]
    };

    return of(mockData);
  }

  /**
   * Refresh dashboard data
   */
  refreshData(): Observable<OverviewData> {
    return this.getOverviewData();
  }
}