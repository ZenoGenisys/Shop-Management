import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartOptions,
  registerables,
} from 'chart.js';
import {
  TransactionService,
  Transaction,
} from '../services/transaction.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  DeleteConfirmationDialog,
  ViewTransactionDialog,
} from '../shared/components';
import { DashboardService } from '../services/dashboard.service';
import { ProfitLossTable } from '../type/dashboard.type';
import { formatINR } from '../utils/currency';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit {
  // Format a number as INR currency string
  // formatINR(value: number | string): string {
  //   const num = typeof value === 'string' ? parseFloat(value) : value;
  //   if (isNaN(num)) return '₹ 0 INR';
  //   return `₹ ${num.toLocaleString('en-IN')} INR`;
  // }
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2200, 2800, 2500, 3000, 3500, 3200, 4000],
        label: 'Sales',
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--blue-500-rgb')
          ? `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--blue-500-rgb')}, 0.6)`
          : 'rgba(33, 150, 243, 0.6)',
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-blue') || '#2196f3',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        data: [1200, 1600, 1500, 1700, 1800, 1900, 2100],
        label: 'Expense',
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--orange-500-rgb')
          ? `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--orange-500-rgb')}, 0.6)`
          : 'rgba(255, 152, 0, 0.6)',
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-orange') || '#ff9800',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        data: [1000, 1200, 1000, 1300, 1700, 1300, 1900],
        label: 'Profit',
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--green-500-rgb')
          ? `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--green-500-rgb')}, 0.6)`
          : 'rgba(76, 175, 80, 0.6)',
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-green') || '#4caf50',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        stacked: false,
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        stacked: false,
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹ ${value}`,
        },
      },
    },
  };

  // Recent Transactions Table
  displayedColumns: string[] = [
    'date',
    'type',
    'category',
    'quantity',
    'payment_method',
    'price',
    'details',
    'action',
  ];
  recentTransactions: Transaction[] = [];
  profitLossData: ProfitLossTable[] = [];
  dataSource = new MatTableDataSource<Transaction>([]);
  isLoading = false;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly transactionService: TransactionService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly dashboardService: DashboardService,
    private readonly router: Router
  ) {
    Chart.register(...registerables);
    // Resolve theme colors from CSS variables for Chart.js (canvas cannot resolve CSS vars itself)
    const css = getComputedStyle(document.documentElement);
    const blueRgb =
      css.getPropertyValue('--blue-500-rgb').trim() || '33, 150, 243';
    const blue = css.getPropertyValue('--brand-blue').trim() || '#2196f3';
    const orangeRgb =
      css.getPropertyValue('--orange-500-rgb').trim() || '255, 152, 0';
    const orange = css.getPropertyValue('--brand-orange').trim() || '#ff9800';
    const greenRgb =
      css.getPropertyValue('--green-500-rgb').trim() || '76, 175, 80';
    const green = css.getPropertyValue('--brand-green').trim() || '#4caf50';

    this.barChartData.datasets[0].backgroundColor = `rgba(${blueRgb}, 0.6)`;
    this.barChartData.datasets[0].borderColor = blue as any;
    this.barChartData.datasets[1].backgroundColor = `rgba(${orangeRgb}, 0.6)`;
    this.barChartData.datasets[1].borderColor = orange as any;
    this.barChartData.datasets[2].backgroundColor = `rgba(${greenRgb}, 0.6)`;
    this.barChartData.datasets[2].borderColor = green as any;
  }

  ngOnInit(): void {
    this.loadRecentTransactions();
    this.loadProfitLossData();
  }

  loadProfitLossData(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService
      .getProfitLoss()
      .pipe(
        catchError((error) => {
          console.error('Error fetching profit/loss data:', error);
          this.error = 'Failed to load profit/loss data. Please try again.';
          return of({
            data: { total_income: '0', total_expense: '0', profit: '0' },
          });
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((response) => {
        this.profitLossData = [
          {
            title: 'Profit',
            value: formatINR(response?.data?.profit ?? '0'),
            icon: 'attach_money',
            color: 'var(--brand-green)'
          },
          {
            title: 'Total Sales',
            value: formatINR(response?.data?.total_income ?? '0'),
            icon: 'shopping_cart',
            color: 'var(--brand-blue)'
          },
          {
            title: 'Expense',
            value: formatINR(response?.data?.total_expense ?? '0'),
            icon: 'people',
            color: 'var(--brand-orange)'
          },
        ];
      });
  }

  loadRecentTransactions(): void {
    this.isLoading = true;
    this.error = null;

    this.transactionService
      .getRecentTransactions(5)
      .pipe(
        catchError((error) => {
          console.error('Error fetching recent transactions:', error);
          this.error = 'Failed to load recent transactions. Please try again.';
          return of({ data: [], page: 1, pageSize: 5, totalRecords: 0 });
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((response) => {
        this.recentTransactions = response.data;
        this.dataSource.data = this.recentTransactions;

        // Re-apply sorting after data is loaded
        if (this.sort && this.dataSource.sort) {
          this.dataSource.sort = this.sort;
        }

        if (this.recentTransactions.length === 0) {
          this.error = 'No recent transactions found.';
        }
      });
  }

  ngAfterViewInit(): void {
    // Wait for the view to be fully initialized
    setTimeout(() => {
      this.setupTableSorting();
    }, 100);
  }

  setupTableSorting(): void {
    if (!this.sort) {
      return;
    }

    // Set up custom sorting for the data source
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date':
          return new Date(item.date).getTime();
        case 'quantity':
          return item.quantity;
        case 'price': {
          // Ensure price is treated as a number for proper sorting
          const price = parseFloat(item.price?.toString() || '0');
          return isNaN(price) ? 0 : price;
        }
        case 'type':
          return item.type;
        case 'category':
          return item.category;
        case 'payment_method':
          return item.payment_method;
        default:
          return '' as any;
      }
    };

    // Set the sort to the data source
    this.dataSource.sort = this.sort;

    // Force a change detection cycle
    this.dataSource.data = [...this.dataSource.data];
  }

  onView(row: Transaction): void {
    if (!row.id) {
      this.snackBar.open('Cannot view transaction without ID', 'Close', { duration: 3000 });
      return;
    }
    this.transactionService.getTransactionById(row.id).subscribe({
      next: (res) => {
        this.dialog.open(ViewTransactionDialog, {
          width: '95vw',
          maxWidth: '500px',
          data: res.data,
        });
      },
      error: () => {
        this.snackBar.open('Failed to load transaction details', 'Close', { duration: 3000 });
      }
    });
  }

  onEdit(row: Transaction): void {
    if (row.id) {
      this.router.navigate(['/add-data', row.id]);
    } else {
      this.snackBar.open('Cannot edit transaction without ID', 'Close', { duration: 3000 });
    }
  }

  onDelete(row: Transaction): void {
    if (!row.id) {
      this.snackBar.open('Cannot delete transaction without ID', 'Close', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '500px',
      data: {
        title: 'Delete Transaction',
        message: 'Are you sure you want to delete this transaction?',
        details: [
          { label: 'Date', value: new Date(row.date).toLocaleDateString() },
          { label: 'Type', value: row.type },
          { label: 'Category', value: row.category },
          { label: 'Quantity', value: row.quantity.toString() },
          { label: 'Payment Method', value: this.getPaymentMethodDisplay(row.payment_method) },
          { label: 'Price', value: `₹${row.price}` },
        ],
        warningText: 'This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteTransaction(row.id!);
      }
    });
  }

  deleteTransaction(id: number): void {
    this.transactionService.deleteTransaction(id).subscribe({
      next: () => {
        this.snackBar.open('Transaction deleted successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });

        // Remove from local array and update data source
        this.recentTransactions = this.recentTransactions.filter(
          (t) => t.id !== id
        );
        this.dataSource.data = this.recentTransactions;

        // Reload data if we have less than 5 transactions
        if (this.recentTransactions.length < 5) {
          this.loadRecentTransactions();
        }
      },
      error: (error) => {
        console.error('Error deleting transaction:', error);
        this.snackBar.open('Failed to delete transaction', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      },
    });
  }

  // Helper methods for display
  getTransactionTypeDisplay(type: string): string {
    return type === 'INCOME' ? 'Income' : 'Expense';
  }

  getCategoryDisplay(category: string): string {
    return category === 'BROILER' ? 'Broiler' : 'Country Chicken';
  }

  getSaleTypeDisplay(sale: string): string {
    return sale === 'STANDARD' ? 'Standard' : 'Skin Out';
  }

  getGenderDisplay(gender: string): string {
    return gender === 'MALE' ? 'Male' : 'Female';
  }

  getPaymentMethodDisplay(method: string): string {
    switch (method) {
      case 'CASH':
        return 'Cash';
      case 'ONLINE':
        return 'Online';
      case 'PENDING':
        return 'Pending';
      default:
        return method;
    }
  }

  getPaymentMethodChipClass(method: string): string {
    switch (method) {
      case 'CASH':
        return 'chip-cash';
      case 'ONLINE':
        return 'chip-online';
      case 'PENDING':
        return 'chip-pending';
      default:
        return '';
    }
  }
}
