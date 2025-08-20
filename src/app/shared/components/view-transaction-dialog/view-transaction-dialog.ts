import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-view-transaction-dialog',
  templateUrl: './view-transaction-dialog.html',
  styleUrls: ['./view-transaction-dialog.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule]
})
export class ViewTransactionDialog {
  constructor(
    public dialogRef: MatDialogRef<ViewTransactionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  get details() {
    const d = this.data || {};
    return [
      { label: 'Date', value: d.date ? (new Date(d.date)).toLocaleDateString() : '-' },
      { label: 'Sale Type', value: d.sale || '-' },
      { label: 'Type', value: d.type || '-' },
      { label: 'Category', value: d.category || '-' },
      { label: 'Gender', value: d.gender || '-' },
      { label: 'Quantity', value: d.quantity ?? '-' },
      { label: 'Payment Method', value: d.payment_method || '-' },
      { label: 'Income Amount', value: d.income_amount ? `₹${d.income_amount}` : '-' },
      { label: 'Purchase Amount', value: d.purchase_amount ? `₹${d.purchase_amount}` : '-' },
      { label: 'Salary Amount', value: d.salary_amount ? `₹${d.salary_amount}` : '-' },
      { label: 'Others Amount', value: d.others_amount ? `₹${d.others_amount}` : '-' },
      { label: 'Total Price', value: d.price ? `₹${d.price}` : '-' },
      { label: 'Details', value: d.details || '-' },
      { label: 'Created At', value: d.created_at ? (new Date(d.created_at)).toLocaleString() : '-' },
      { label: 'Updated At', value: d.updated_at ? (new Date(d.updated_at)).toLocaleString() : '-' },
      { label: 'Created By', value: d.created_by || '-' },
      { label: 'Updated By', value: d.updated_by || '-' },
    ];
  }

  close(): void {
    this.dialogRef.close();
  }
}
