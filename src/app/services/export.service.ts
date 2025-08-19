import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
