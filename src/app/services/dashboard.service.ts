import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_URL } from '../config';
import { API } from '../api-path';
import { ProfitLossResponse } from '../type/dashboard.type';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // New method to get chart data by range
  getChartData(params: any): Observable<any> {
    return this.http.get<any>(`${API_URL}/dashboard/chart-data`, { params })
      .pipe(catchError(this.handleError));
  }

  constructor(private readonly http: HttpClient) { }

  getProfitLoss(): Observable<ProfitLossResponse> {
    return this.http.get<ProfitLossResponse>(`${API_URL}${API.PROFIT_LOSS}`)
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
