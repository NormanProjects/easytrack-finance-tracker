import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../../core/services/dashboard';
import { AuthService } from '../../../../core/services/auth';
import { ToastService } from '../../../../core/services/toast';
import { DashboardSummary } from '../../../../core/models/dashboard.model';

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

  userName: string = 'User';
  currentDate: Date = new Date();
  isLoading: boolean = true;
  Math = Math;

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
    private dashboardService: DashboardService,
    private authService: AuthService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    this.loadOverviewData();
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data is loaded
  }

  /**
   * Load user name from auth service
   */
  loadUserName(): void {
    // Option 1: Subscribe to currentUser$ observable
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.firstName || user.name || 'User';
        console.log('User name loaded:', this.userName);
      }
    });

    // Option 2: Get from currentUserValue property
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.userName = currentUser.firstName || currentUser.name || 'User';
    }

    // Option 3: Fallback to localStorage
    if (this.userName === 'User') {
      const storedUser = localStorage.getItem('easytrack_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          this.userName = userData.firstName || userData.name || 'User';
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }

  /**
   * Load overview data from backend
   */
  loadOverviewData(): void {
    this.isLoading = true;

    this.dashboardService.getSummary().subscribe({
      next: (data: DashboardSummary) => {
        console.log('Dashboard data loaded:', data);
        
        // Map backend data to overview format
        this.overview = {
          currentBalance: data.totalBalance || 0,
          balanceChange: data.monthlyChange || 0,
          monthlyIncome: data.monthlyIncome || 0,
          incomeGrowth: data.incomeChange || 0,
          monthlyExpenses: data.monthlyExpenses || 0,
          expenseGrowth: data.expenseChange || 0,
          totalSavings: data.totalSavings || 0,
          savingsRate: data.savingsRate || 0,
          largestExpense: 0, // TODO: Get from data
          avgDailySpending: data.avgDailySpending || 0,
          activeBudgets: data.activeBudgets || 0,
          totalBudgets: data.totalBudgets || 0,
          transactionsThisMonth: data.transactionsCount || 0,
          recentTransactions: this.mapRecentTransactions(data.recentTransactions),
          budgets: data.budgets || [],
          goals: [] // TODO: Add goals endpoint
        };

        this.isLoading = false;
        
        // Initialize chart after data is loaded
        setTimeout(() => {
          this.initializeSpendingChart();
        }, 100);
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        
        // Show error toast
        this.toastService.error('Failed to load dashboard data');
        
        // Set empty state
        this.overview = this.getEmptyOverview();
        
        setTimeout(() => {
          this.initializeSpendingChart();
        }, 100);
      }
    });
  }

  /**
   * Map recent transactions from backend format
   */
  private mapRecentTransactions(transactions: any[]): RecentTransaction[] {
    if (!transactions || transactions.length === 0) return [];
    
    return transactions.map((t: any) => ({
      id: t.id,
      description: t.description,
      category: t.category,
      amount: t.amount,
      type: t.type,
      date: new Date(t.date)
    }));
  }

  /**
   * Get empty overview state
   */
  private getEmptyOverview(): Overview {
    return {
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
  }

  /**
   * Initialize spending trend chart
   */
  private initializeSpendingChart(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.spendingChartRef) return;

    if (this.spendingChart) {
      this.spendingChart.destroy();
    }

    const ctx = this.spendingChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [0, 0, 0, 0, 0, 0, 0];

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
              callback: (value: any) => `R${value.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  navigateToTransactions(): void {
    this.router.navigate(['/transactions']);
  }
}