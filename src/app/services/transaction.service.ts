import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_URL } from '../config';


export interface Transaction {
  id?: number;
  date: string;
  sale: "STANDARD" | "SKIN_OUT";
  type: "INCOME" | "EXPENSE";
  category: "BROILER" | "COUNTRY_CHICKEN";
  gender: "MALE" | "FEMALE";
  quantity: number;
  payment_method: "CASH" | "ONLINE" | "PENDING";
  details?: string;
  income_amount?: number;
  purchase_amount?: number;
  salary_amount?: number;
  others_amount?: number;
  price?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: "INCOME" | "EXPENSE";
  category?: "BROILER" | "COUNTRY_CHICKEN";
  payment_method?: "CASH" | "ONLINE" | "PENDING";
}

export interface TransactionResponse {
  data: Transaction[];
  page: number;
  pageSize: number;
  totalRecords: number;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: "INCOME" | "EXPENSE";
  category?: "BROILER" | "COUNTRY_CHICKEN";
  payment_method?: "CASH" | "ONLINE" | "PENDING";
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private readonly http: HttpClient) { }

  getRecentTransactions(limit: number = 5, onError?: (msg: string) => void): Observable<TransactionResponse> {
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', limit.toString())
      .set('sortBy', 'date')
      .set('sortOrder', 'desc');
    return this.http.get<TransactionResponse>(`${API_URL}/transaction`, { params })
      .pipe(catchError(err => this.handleError(err, onError)));
  }

  getAllTransactions(
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'date',
    sortOrder: string = 'desc',
    filters?: TransactionFilters,
    onError?: (msg: string) => void
  ): Observable<TransactionResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (filters) {
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.payment_method) {
        params = params.set('payment_method', filters.payment_method);
      }
    }

    return this.http.get<TransactionResponse>(`${API_URL}/transaction`, { params })
      .pipe(catchError(err => this.handleError(err, onError)));
  }

  getTransactionById(id: number, onError?: (msg: string) => void): Observable<{ data: Transaction }> {
    return this.http.get<{ data: Transaction }>(`${API_URL}/transaction/${id}`)
      .pipe(catchError(err => this.handleError(err, onError)));
  }

  createTransaction(transaction: Omit<Transaction, 'id'>, onError?: (msg: string) => void): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/transaction`, transaction)
      .pipe(catchError(err => this.handleError(err, onError)));
  }

  updateTransaction(id: number, transaction: Partial<Transaction>, onError?: (msg: string) => void): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_URL}/transaction/${id}`, transaction)
      .pipe(catchError(err => this.handleError(err, onError)));
  }

  deleteTransaction(id: number, onError?: (msg: string) => void): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/transaction/${id}`)
      .pipe(catchError(err => this.handleError(err, onError)));
  }

  private handleError(error: HttpErrorResponse, onError?: (msg: string) => void): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.error || error.message || `Error Code: ${error.status}`;
    }
    if (onError) {
      onError(errorMessage);
    }
    console.error('Transaction service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
