import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

export interface TransactionResponse {
  data: Transaction[];
  page: number;
  pageSize: number;
  totalRecords: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getRecentTransactions(limit: number = 5): Observable<TransactionResponse> {
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', limit.toString())
      .set('sortBy', 'date')
      .set('sortOrder', 'desc');

    return this.http.get<TransactionResponse>(`${this.API_URL}/transaction`, { params })
      .pipe(catchError(this.handleError));
  }

  getAllTransactions(
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'date',
    sortOrder: string = 'desc'
  ): Observable<TransactionResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    return this.http.get<TransactionResponse>(`${this.API_URL}/transaction`, { params })
      .pipe(catchError(this.handleError));
  }

  getTransactionById(id: number): Observable<{ data: Transaction }> {
    return this.http.get<{ data: Transaction }>(`${this.API_URL}/transaction/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTransaction(transaction: Omit<Transaction, 'id'>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/transaction`, transaction)
      .pipe(catchError(this.handleError));
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/transaction/${id}`, transaction)
      .pipe(catchError(this.handleError));
  }

  deleteTransaction(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/transaction/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.error || error.message || `Error Code: ${error.status}`;
    }
    
    console.error('Transaction service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
