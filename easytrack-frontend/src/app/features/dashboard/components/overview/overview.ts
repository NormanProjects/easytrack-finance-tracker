import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { OverviewService } from '../../../../core/services/overview';

Chart.register(...registerables);

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

interface Overview {
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

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('spendingChart') spendingChartRef!: ElementRef<HTMLCanvasElement>;

  userName: string = 'John';
  currentDate: Date = new Date();
  isLoading: boolean = true;
  Math = Math; // Make Math available in template

  overview: Overview = {
    currentBalance: 0,
    balanceChange: 0,
    monthlyIncome: 0,
    incomeGrowth: 0,
    monthlyExpenses: 0,
    expenseGrowth: 0,
    totalSavings: 0,
    savingsRate: 0,
    largestExpense: 0,
    avgDailySpending: 0,
    activeBudgets: 0,
    totalBudgets: 0,
    transactionsThisMonth: 0,
    recentTransactions: [],
    budgets: [],
    goals: []
  };

  private spendingChart?: Chart;

  constructor(
    private router: Router,
    private overviewService: OverviewService
  ) {}

  ngOnInit(): void {
    this.loadOverviewData();
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data is loaded
  }

  /**
   * Load overview data
   */
  loadOverviewData(): void {
    this.isLoading = true;

    // Use service to load data
    this.overviewService.getOverviewData().subscribe({
      next: (data) => {
        this.overview = data;
        this.isLoading = false;
        
        // Initialize chart after data is loaded
        setTimeout(() => {
          this.initializeSpendingChart();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading overview data:', error);
        this.isLoading = false;
        // Fall back to mock data
        this.overview = this.generateMockData();
        setTimeout(() => {
          this.initializeSpendingChart();
        }, 100);
      }
    });
  }

  /**
   * Initialize spending trend chart
   */
  private initializeSpendingChart(): void {
    if (!this.spendingChartRef) return;

    if (this.spendingChart) {
      this.spendingChart.destroy();
    }

    const ctx = this.spendingChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [2450, 3890, 2100, 4200, 1850, 3450, 2900];

    this.spendingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Daily Spending',
          data,
          backgroundColor: 'rgba(0, 255, 148, 0.1)',
          borderColor: '#00FF94',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#00FF94',
          pointBorderColor: '#0A1628',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(10, 22, 40, 0.9)',
            titleColor: '#fff',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context: any) => {
                return `Spent: R${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748B',
              font: { size: 11 }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#64748B',
              font: { size: 11 },
              callback: (value: any) => `R${(value / 1000).toFixed(1)}k`
            }
          }
        }
      }
    });
  }

  /**
   * Generate mock data for demonstration
   */
  private generateMockData(): Overview {
    return {
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
          date: new Date()
        },
        {
          id: '2',
          description: 'Salary Deposit',
          category: 'Income',
          amount: 75000,
          type: 'income',
          date: new Date()
        },
        {
          id: '3',
          description: 'Electricity Bill',
          category: 'Bills & Utilities',
          amount: 2100,
          type: 'expense',
          date: new Date()
        },
        {
          id: '4',
          description: 'Freelance Payment',
          category: 'Income',
          amount: 8500,
          type: 'income',
          date: new Date()
        },
        {
          id: '5',
          description: 'Gas Station',
          category: 'Transportation',
          amount: 850,
          type: 'expense',
          date: new Date()
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
  }

  /**
   * Navigate to transactions page
   */
  navigateToTransactions(): void {
    this.router.navigate(['/transactions']);
  }
}