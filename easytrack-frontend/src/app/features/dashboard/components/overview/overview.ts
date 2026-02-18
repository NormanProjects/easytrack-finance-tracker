import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
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

  overview: Overview = this.getEmptyOverview();

  private spendingChart?: Chart;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    this.loadOverviewData();
  }

  ngAfterViewInit(): void {
  
  }

  loadUserName(): void {
  this.authService.currentUser$.subscribe(user => {
    if (user) {
      this.userName = user.firstName || user.name || 'User';
      console.log('User name loaded:', this.userName);
    }
  });

  const currentUser = this.authService.currentUserValue;
  if (currentUser) {
    this.userName = currentUser.firstName || currentUser.name || 'User';
  }

  if (this.userName === 'User') {
    const storedUser = localStorage.getItem('easytrack_user');
    if (storedUser && storedUser !== 'undefined') {  // ✅ ADD THIS CHECK
      try {
        const userData = JSON.parse(storedUser);
        this.userName = userData.firstName || userData.name || 'User';
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }
}

  loadOverviewData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.dashboardService.getSummary().subscribe({
      next: (data: DashboardSummary) => {
        console.log('Dashboard data loaded:', data);

        this.overview = {
          // Direct fields
          currentBalance:        (data.totalBalance     as number) ?? 0,
          monthlyIncome:         (data.monthlyIncome    as number) ?? 0,
          monthlyExpenses:       (data.monthlyExpense   as number) ?? 0,  
          totalSavings:          (data.netIncome        as number) ?? 0,

          // From spendingComparison
          balanceChange:         (data.spendingComparison?.difference       as number) ?? 0,
          expenseGrowth:         (data.spendingComparison?.percentageChange as number) ?? 0,

          // From budgetSummary
          avgDailySpending:      (data.budgetSummary?.safeToSpendDaily      as number) ?? 0,

          // From quickStats
          transactionsThisMonth: data.quickStats?.monthlyTransactions ?? 0,
          activeBudgets:         data.quickStats?.activeAccounts      ?? 0,
          totalBudgets:          data.quickStats?.totalAccounts        ?? 0,

          // Calculated
          incomeGrowth: 0,
          savingsRate: data.monthlyIncome
            ? Math.round(((data.netIncome as number ?? 0) / (data.monthlyIncome as number)) * 100)
            : 0,
          largestExpense: 0,

          // Lists
          recentTransactions: this.mapRecentTransactions(data.recentTransactions ?? []),
          budgets: [],
          goals: []
        };

        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initializeSpendingChart(), 100);
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.toastService.error('Failed to load dashboard data');
        this.overview = this.getEmptyOverview();
        setTimeout(() => this.initializeSpendingChart(), 100);
      }
    });
  }

  private mapRecentTransactions(transactions: any[]): RecentTransaction[] {
    if (!transactions || transactions.length === 0) return [];

    return transactions.map((t: any) => ({
      id:          t.id,
      description: t.description,
      category:    t.category,
      amount:      t.amount,
      type:        (t.type?.toLowerCase() === 'income' ? 'income' : 'expense') as 'income' | 'expense',
      date:        new Date(t.date || t.transactionDate)
    }));
  }

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

  private initializeSpendingChart(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.spendingChartRef) return;

    if (this.spendingChart) {
      this.spendingChart.destroy();
    }

    const ctx = this.spendingChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.spendingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Daily Spending',
          data: [0, 0, 0, 0, 0, 0, 0],
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
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10, 22, 40, 0.9)',
            titleColor: '#fff',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context: any) => `Spent: R${context.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748B', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
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