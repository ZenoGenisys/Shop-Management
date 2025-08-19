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
import { finalize } from 'rxjs/operators';

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
    MatSnackBarModule
  ]
})
export class AddDataComponent implements OnInit {
  transactionForm!: FormGroup;
  isSubmitting = false;
  
  constructor(
    private readonly fb: FormBuilder,
    private readonly transactionService: TransactionService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

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
      purchase_amount: [0, [Validators.min(0)]],
      salary_amount: [0, [Validators.min(0)]],
      others_amount: [0, [Validators.min(0)]],
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
        ctrl.setValue(0);
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
      // Format the date to 'YYYY-MM-DD' for MySQL
      let formattedDate = formValue.date;
      if (formattedDate instanceof Date) {
        formattedDate = formattedDate.toISOString().slice(0, 10);
      } else if (typeof formattedDate === 'string' && formattedDate.length > 10) {
        // If string is ISO, slice to date part
        formattedDate = formattedDate.slice(0, 10);
      }
      const formattedData = {
        ...formValue,
        date: formattedDate,
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
            this.router.navigate(['/dashboard']);
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
}
