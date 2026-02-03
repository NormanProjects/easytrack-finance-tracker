import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

interface TopTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

interface Insight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  action?: string;
}

interface Analytics {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  incomeChange: number;
  expenseChange: number;
  savingsRate: number;
  avgDailySpending: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
  topTransactions: TopTransaction[];
  insights: Insight[];
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('incomeExpenseChart') incomeExpenseChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cashFlowChart') cashFlowChartRef!: ElementRef<HTMLCanvasElement>;

  isLoading: boolean = true;
  selectedPeriod: string = 'month';
  chartView: string = 'line';

  analytics: Analytics = {
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    incomeChange: 0,
    expenseChange: 0,
    savingsRate: 0,
    avgDailySpending: 0,
    transactionCount: 0,
    categoryBreakdown: [],
    topTransactions: [],
    insights: []
  };

  private incomeExpenseChart?: Chart;
  private categoryChart?: Chart;
  private cashFlowChart?: Chart;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  /**
   * Load analytics data
   */
  loadAnalytics(): void {
    this.isLoading = true;

    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.analytics = this.generateMockData();
      this.isLoading = false;
      
      // Initialize charts after data is loaded
      setTimeout(() => {
        this.initializeCharts();
      }, 100);
    }, 1000);
  }

  /**
   * Initialize all charts
   */
  private initializeCharts(): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.createIncomeExpenseChart();
    this.createCategoryChart();
    this.createCashFlowChart();
  }

  /**
   * Create Income vs Expense Chart
   */
  private createIncomeExpenseChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.incomeExpenseChartRef) return;

    // Destroy existing chart
    if (this.incomeExpenseChart) {
      this.incomeExpenseChart.destroy();
    }

    const ctx = this.incomeExpenseChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeData = [45000, 52000, 48000, 61000, 55000, 67000];
    const expenseData = [38000, 42000, 45000, 48000, 44000, 52000];

    this.incomeExpenseChart = new Chart(ctx, {
      type: this.chartView as any,
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(0, 255, 148, 0.1)',
            borderColor: '#00FF94',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#94A3B8',
              font: { size: 12 },
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(10, 22, 40, 0.9)',
            titleColor: '#fff',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context: any) => {
                return `${context.dataset.label}: R${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
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
              callback: (value: number) => `R${(value as number / 1000).toFixed(0)}k`
            }
          }
        }
      }
    });
  }

  /**
   * Create Category Breakdown Chart
   */
  private createCategoryChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.categoryChartRef) return;

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const categories = this.analytics.categoryBreakdown;
    const labels = categories.map(c => c.name);
    const data = categories.map(c => c.amount);
    const colors = categories.map(c => c.color);

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: '#94A3B8',
              font: { size: 11 },
              padding: 12,
              usePointStyle: true,
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i] as number;
                    return {
                      text: `${label}: R${value.toLocaleString()}`,
                      fillStyle: colors[i],
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(10, 22, 40, 0.9)',
            titleColor: '#fff',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context: any) => {
                const total = context.dataset.data.reduce((a: number, b: any) => a + b, 0) as number;
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: R${context.parsed.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  /**
   * Create Cash Flow Chart
   */
  private createCashFlowChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.cashFlowChartRef) return;

    if (this.cashFlowChart) {
      this.cashFlowChart.destroy();
    }

    const ctx = this.cashFlowChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const data = [15000, -8000, 22000, -5000];

    this.cashFlowChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Net Cash Flow',
          data,
          backgroundColor: data.map(v => v >= 0 ? 'rgba(0, 255, 148, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
          borderColor: data.map(v => v >= 0 ? '#00FF94' : '#ef4444'),
          borderWidth: 2,
          borderRadius: 8
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
            callbacks: {
              label: (context: any) => {
                return `Net: R${context.parsed.y.toLocaleString()}`;
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
              callback: (value) => `R${(value as number / 1000).toFixed(0)}k`
            }
          }
        }
      }
    });
  }

  /**
   * Generate mock data for demonstration
   */
  private generateMockData(): Analytics {
    return {
      totalIncome: 328500,
      totalExpenses: 269000,
      netAmount: 59500,
      incomeChange: 12.5,
      expenseChange: -8.3,
      savingsRate: 18.1,
      avgDailySpending: 8966.67,
      transactionCount: 247,
      categoryBreakdown: [
        { name: 'Food & Dining', amount: 45200, percentage: 16.8, count: 87, color: '#ef4444' },
        { name: 'Transportation', amount: 38500, percentage: 14.3, count: 34, color: '#f97316' },
        { name: 'Shopping', amount: 52100, percentage: 19.4, count: 42, color: '#eab308' },
        { name: 'Bills & Utilities', amount: 67800, percentage: 25.2, count: 28, color: '#3b82f6' },
        { name: 'Entertainment', amount: 28400, percentage: 10.6, count: 31, color: '#8b5cf6' },
        { name: 'Healthcare', amount: 18200, percentage: 6.8, count: 12, color: '#ec4899' },
        { name: 'Other', amount: 18800, percentage: 7.0, count: 13, color: '#64748b' }
      ],
      topTransactions: [
        { id: '1', description: 'Rent Payment', amount: 15000, type: 'expense', date: new Date('2024-01-01') },
        { id: '2', description: 'Salary Deposit', amount: 65000, type: 'income', date: new Date('2024-01-05') },
        { id: '3', description: 'Car Insurance', amount: 8500, type: 'expense', date: new Date('2024-01-10') },
        { id: '4', description: 'Freelance Project', amount: 12000, type: 'income', date: new Date('2024-01-15') },
        { id: '5', description: 'Shopping Spree', amount: 4200, type: 'expense', date: new Date('2024-01-20') }
      ],
      insights: [
        {
          title: 'Great Savings Rate!',
          description: 'You\'re saving 18% of your income this month. Keep up the excellent work!',
          type: 'success',
          action: 'View Savings Goals'
        },
        {
          title: 'High Dining Expenses',
          description: 'Your food & dining expenses are 25% higher than last month. Consider meal planning to reduce costs.',
          type: 'warning',
          action: 'Set Budget Alert'
        },
        {
          title: 'Upcoming Bill Due',
          description: 'You have a utility bill of R3,450 due in 3 days. Make sure you have sufficient funds.',
          type: 'info',
          action: 'View Bills'
        },
        {
          title: 'Income Increase',
          description: 'Your income increased by 12.5% compared to last month. Great job!',
          type: 'success'
        }
      ]
    };
  }

  /**
   * Export analytics report
   */
  exportReport(): void {
    console.log('Exporting analytics report...');
    alert('Export functionality will download a detailed PDF report.');
  }

  /**
   * Track by functions for performance
   */
  trackByCategory(index: number, category: CategoryBreakdown): string {
    return category.name;
  }

  trackByTransaction(index: number, transaction: TopTransaction): string {
    return transaction.id;
  }
}