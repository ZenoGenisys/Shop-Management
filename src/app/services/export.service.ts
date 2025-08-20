import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private readonly http: HttpClient) {}

  downloadSample(): Observable<Blob> {
    return this.http.get(`${API_URL}/export/sample`, { responseType: 'blob' });
  }

  exportTransactions(filters: any = {}): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get(`${API_URL}/export`, {
      params,
      responseType: 'blob',
      observe: 'body',
    });
  }
}
