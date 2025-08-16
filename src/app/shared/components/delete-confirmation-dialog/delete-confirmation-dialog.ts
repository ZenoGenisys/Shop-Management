import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteConfirmationData {
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  details?: Array<{ label: string; value: string | number; type?: 'text' | 'amount' | 'status' }>;
  warningText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2>{{ data.title || 'Delete Item' }}</h2>
      </div>
      
      <div class="dialog-content">
        <p>{{ data.message || 'Are you sure you want to delete this item?' }}</p>
        
        <div class="item-details" *ngIf="data.details && data.details.length > 0">
          <div class="detail-row" *ngFor="let detail of data.details">
            <span class="label">{{ detail.label }}:</span>
            <span class="value" [ngClass]="getValueClass(detail)">
              <span *ngIf="detail.type === 'amount'">₹</span>
              {{ detail.value }}
              <span *ngIf="detail.type === 'amount' && detail.value === 0">.00</span>
            </span>
          </div>
        </div>
        
        <p class="warning-text" *ngIf="data.warningText">
          <mat-icon>info</mat-icon>
          {{ data.warningText }}
        </p>
      </div>
      
      <div class="dialog-actions">
        <button mat-button (click)="onCancel()">
          {{ data.cancelButtonText || 'Cancel' }}
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          <mat-icon>delete</mat-icon>
          {{ data.confirmButtonText || 'Delete' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog {
      padding: 0;
      max-width: 500px;
      width: 100%;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid var(--neutral-200);

      .warning-icon {
        color: var(--brand-orange);
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      h2 {
        margin: 0;
        color: var(--neutral-900);
        font-size: 20px;
        font-weight: 600;
      }
    }

    .dialog-content {
      padding: 24px;

      p {
        margin: 0 0 20px 0;
        color: var(--neutral-700);
        font-size: 16px;
        line-height: 1.5;
      }

      .item-details {
        background: var(--neutral-100);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--neutral-200);

          &:last-child {
            border-bottom: none;
          }

          .label {
            font-weight: 600;
            color: var(--neutral-700);
            font-size: 14px;
          }

          .value {
            color: var(--neutral-900);
            font-size: 14px;

            &.amount {
              font-weight: 700;
              font-size: 16px;
              color: var(--neutral-900);
            }

            &.status {
              font-weight: 600;
            }
          }
        }
      }

      .warning-text {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--brand-orange);
        font-size: 14px;
        font-weight: 500;
        margin: 0;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px 24px;
      border-top: 1px solid var(--neutral-200);

      button {
        min-width: 100px;
      }
    }
  `]
})
export class DeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationData
  ) {}

  getValueClass(detail: any): string {
    if (detail.type === 'amount') return 'amount';
    if (detail.type === 'status') return 'status';
    return '';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
