import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { ExportService } from '../services/export.service';
import { ImportService } from '../services/import.service';
import { finalize } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.html',
  styleUrls: ['./add-data.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatRadioModule,
    MatSnackBarModule,
    MatIconModule
  ]
})

export class AddDataComponent implements OnInit {
  transactionForm!: FormGroup;
  isSubmitting = false;
  uploading = false;
  uploadSuccess = false;
  uploadError: string | null = null;
  dragOver = false;
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file && file.name.endsWith('.xlsx')) {
        this.onFileSelected({ target: { files: [file] } } as any);
      } else {
        this.uploadError = 'Only .xlsx files are allowed.';
        this.uploadSuccess = false;
      }
    }
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly transactionService: TransactionService,
    private readonly exportService: ExportService,
    private readonly importService: ImportService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.uploading = true;
    this.uploadSuccess = false;
    this.uploadError = null;
    this.importService.uploadFile(file).subscribe({
      next: () => {
        this.uploading = false;
        this.uploadSuccess = true;
        this.snackBar.open('File uploaded successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        setTimeout(() => {
          this.uploadSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadSuccess = false;
        if (err.error?.details && Array.isArray(err.error.details)) {
          // Show validation errors in a readable format
          this.uploadError = 'Validation failed:\n' + err.error.details.map((d: any) => `Row ${d.row}: ${d.error}`).join('\n');
        } else {
          this.uploadError = err.error?.error || 'Failed to upload file';
        }
        this.snackBar.open(this.uploadError || 'Failed to upload file', 'Close', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }
  downloadSampleTemplate() {
    this.exportService.downloadSample().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transaction_sample.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Failed to download sample template', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.transactionForm = this.fb.group({
      date: ['', Validators.required],
      sale: ['STANDARD', Validators.required],
      type: ['INCOME', Validators.required],
      category: ['', Validators.required],
      gender: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      payment_method: ['CASH', Validators.required],
      details: [''],
      income_amount: ['', Validators.required],
      purchase_amount: ['', [Validators.min(0)]],
      salary_amount: [''],
      others_amount: [''],
      price: [{ value: '', disabled: true }]
    });

    // Listen to changes and recalculate price
    this.transactionForm.valueChanges.subscribe(() => {
      this.updateTotalAmount();
    });

    const typeControl = this.transactionForm.get('type');
    if (typeControl) {
      typeControl.valueChanges.subscribe(type => {
        this.handleTypeChange(type);
        this.updateTotalAmount();
      });
    }
  }

  private updateTotalAmount() {
    if (!this.transactionForm) return;
    const type = this.transactionForm.get('type')?.value;
    const income = parseFloat(this.transactionForm.get('income_amount')?.value) || 0;
    const purchase = parseFloat(this.transactionForm.get('purchase_amount')?.value) || 0;
    const salary = parseFloat(this.transactionForm.get('salary_amount')?.value) || 0;
    const others = parseFloat(this.transactionForm.get('others_amount')?.value) || 0;
    let total = 0;
    if (type === 'INCOME') {
      total = income;
    } else {
      total = purchase + salary + others;
    }
    this.transactionForm.get('price')?.setValue(total, { emitEvent: false });
  }

  get transactionType() {
    return this.transactionForm?.get('type')?.value;
  }

  private handleTypeChange(type: string) {
    if (!this.transactionForm) return;

    // Always clear and reset validators for all amount fields except income_amount
    ['purchase_amount', 'salary_amount', 'others_amount'].forEach(control => {
      const ctrl = this.transactionForm.get(control);
      if (ctrl) {
        ctrl.setValue('');
        ctrl.clearValidators();
        ctrl.updateValueAndValidity();
      }
    });

    const incomeCtrl = this.transactionForm.get('income_amount');
    if (type === 'INCOME') {
      if (incomeCtrl) {
        incomeCtrl.setValidators([Validators.required]);
        incomeCtrl.updateValueAndValidity();
      }
    } else {
      if (incomeCtrl) {
        incomeCtrl.setValue('');
        incomeCtrl.clearValidators();
        incomeCtrl.updateValueAndValidity();
      }
      const purchaseCtrl = this.transactionForm.get('purchase_amount');
      if (purchaseCtrl) {
        purchaseCtrl.setValidators([Validators.required]);
        purchaseCtrl.updateValueAndValidity();
      }
    }
  }

  onSubmit() {
    if (this.transactionForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      // Get all values including disabled
      const formValue = { ...this.transactionForm.getRawValue() };
      // Format the date as local YYYY-MM-DD (not UTC)
      let formattedDate = formValue.date;
      if (formattedDate instanceof Date) {
        const year = formattedDate.getFullYear();
        const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
        const day = formattedDate.getDate().toString().padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      } else if (typeof formattedDate === 'string' && formattedDate.length > 10) {
        // If string is ISO, slice to date part
        formattedDate = formattedDate.slice(0, 10);
      }
      const formattedData = {
        ...formValue,
        date: formattedDate,
        quantity: parseFloat(formValue.quantity) || 0,
        income_amount: parseFloat(formValue.income_amount) || 0,
        purchase_amount: parseFloat(formValue.purchase_amount) || 0,
        salary_amount: parseFloat(formValue.salary_amount) || 0,
        others_amount: parseFloat(formValue.others_amount) || 0,
        details: typeof formValue.details === 'string' ? formValue.details : '',
      };

      this.transactionService.createTransaction(formattedData)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (response) => {
            this.snackBar.open('Transaction added successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.onReset();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Failed to add transaction', 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
    }
  }

  onReset() {
    // Completely rebuild the form to ensure clean state
    this.initForm();
  }
}