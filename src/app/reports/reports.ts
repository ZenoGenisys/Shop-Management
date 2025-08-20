import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TransactionService, Transaction } from '../services/transaction.service';
import { API_URL } from '../config';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { DeleteConfirmationDialog } from '../shared/components/delete-confirmation-dialog/delete-confirmation-dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
  // MatDateRangeInputModule,
  // MatDateRangePickerModule,
  MatNativeDateModule,
  MatDialogModule,
  MatSnackBarModule
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports implements OnInit, AfterViewInit {
  filterForm: FormGroup;
  showFilter = false;
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
  dataSource = new MatTableDataSource<Transaction>([]);
  isLoading = false;
  error: string | null = null;
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly transactionService: TransactionService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      type: [''],
      category: [''],
      payment_method: ['']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe(sort => {
        this.onSortChange(sort);
      });
    }
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  loadTransactions(page: number = 1, pageSize: number = 10, sortBy: string = this.sortBy, sortOrder: 'asc' | 'desc' = this.sortOrder): void {
    this.isLoading = true;
    this.error = null;
    // Collect filter values, omit empty strings, and convert dates to YYYY-MM-DD
    const rawFilters = this.filterForm.value;
    const filters: any = {};
    Object.keys(rawFilters).forEach(key => {
      if (rawFilters[key] !== '' && rawFilters[key] !== null) {
        if ((key === 'startDate' || key === 'endDate') && rawFilters[key] instanceof Date) {
          // Convert to YYYY-MM-DD
          const d = rawFilters[key] as Date;
          filters[key] = d.toISOString().slice(0, 10);
        } else {
          filters[key] = rawFilters[key];
        }
      }
    });
    this.transactionService.getAllTransactions(page, pageSize, sortBy, sortOrder, filters)
      .pipe(
        catchError((error) => {
          this.error = error.message || 'Failed to load transactions.';
          return of({ data: [], page: 1, pageSize, totalRecords: 0 });
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((response) => {
        this.dataSource.data = response.data;
        this.totalRecords = response.totalRecords;
        this.pageSize = response.pageSize;
        this.pageIndex = response.page - 1;
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      });
  }

  applyFilters(): void {
    this.loadTransactions(1, this.pageSize, this.sortBy, this.sortOrder);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      type: '',
      category: '',
      payment_method: ''
    });
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.loadTransactions(event.pageIndex + 1, event.pageSize, this.sortBy, this.sortOrder);
  }

  onSortChange(sort: {active: string, direction: string}): void {
    if (!sort.direction) {
      // No sort: reset to default
      this.sortBy = 'date';
      this.sortOrder = 'desc';
    } else {
      this.sortBy = sort.active;
      this.sortOrder = sort.direction as 'asc' | 'desc';
    }
    this.loadTransactions(this.pageIndex + 1, this.pageSize, this.sortBy, this.sortOrder);
  }

  onImportClick(): void {
    // Create a hidden file input and trigger click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        // Call backend API for import
        fetch('/api/export', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Import failed');
            }
            alert('Import successful!');
            this.loadTransactions();
          })
          .catch((err) => alert('Import failed: ' + err.message));
      }
    };
    input.click();
  }

  onExportClick(): void {
    // Call backend API for export and trigger file download
    fetch(`${API_URL}/export`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          let err;
          try { err = await res.json(); } catch { err = {}; }
          throw new Error(err.error || 'Export failed');
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions_export.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => alert('Export failed: ' + err.message));
  }

  onView(row: Transaction): void {
    // For now, just show details in an alert
    alert('Transaction Details:\n' + JSON.stringify(row, null, 2));
  }

  onEdit(row: Transaction): void {
    // For now, just show edit info in an alert
    alert('Edit Transaction (not implemented):\n' + JSON.stringify(row, null, 2));
  }

  onDelete(row: Transaction): void {
    if (!row.id) {
      this.snackBar.open('Cannot delete transaction without ID', 'Close', { duration: 3000 });
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
        // Call backend API to delete
        fetch(`/api/transaction/${row.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Delete failed');
            }
            this.snackBar.open('Transaction deleted successfully', 'Close', { duration: 3000 });
            this.loadTransactions();
          })
          .catch((err) => this.snackBar.open('Delete failed: ' + err.message, 'Close', { duration: 3000 }));
      }
    });
  }

  getTransactionTypeDisplay(type: string): string {
    return type === 'INCOME' ? 'Income' : 'Expense';
  }

  getCategoryDisplay(category: string): string {
    return category === 'BROILER' ? 'Broiler' : 'Country Chicken';
  }

  getPaymentMethodDisplay(method: string): string {
    switch (method) {
      case 'CASH': return 'Cash';
      case 'ONLINE': return 'Online';
      case 'PENDING': return 'Pending';
      default: return method;
    }
  }

  getPaymentMethodChipClass(method: string): string {
    switch (method) {
      case 'CASH': return 'chip-cash';
      case 'ONLINE': return 'chip-online';
      case 'PENDING': return 'chip-pending';
      default: return '';
    }
  }

  onAddData(): void {
    this.router.navigate(['/add-data']);
  }

}
