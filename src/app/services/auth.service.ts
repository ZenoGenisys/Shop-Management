import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { API_URL } from '../config';
import { API } from '../api-path';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  msg: string;
  token: string;
  user: {
    username: string;
  };
}

export interface User {
  username: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private logoutTimer: any = null;
  private readonly jwtHelper = new JwtHelperService();

  readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(readonly http: HttpClient, readonly router: Router) {
    this.loadStoredUser();
    this.setupAutoLogout();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}${API.LOGIN}`, credentials)
      .pipe(
        tap((response) => {
          this.storeUser({
            username: response.user.username,
            token: response.token,
          });
          this.setupAutoLogout();
        })
      );
  }

  logout(): void {
    this.clearStoredUser();
    this.clearAutoLogout();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.setupAutoLogout();
  }

  private clearStoredUser(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private loadStoredUser(): void {
    const token = this.getStoredToken();
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch {
        this.clearStoredUser();
      }
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // --- Proactive auto logout logic ---
  private setupAutoLogout(): void {
    this.clearAutoLogout();
    const token = this.getStoredToken();
    if (token) {
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      if (expirationDate) {
        const now = new Date();
        const msUntilExpiry = expirationDate.getTime() - now.getTime();
        if (msUntilExpiry > 0) {
          // Auto logout 5 seconds before expiry
          this.logoutTimer = setTimeout(() => {
            this.logout();
          }, msUntilExpiry - 5000 > 0 ? msUntilExpiry - 5000 : 0);
        } else {
          // Token already expired
          this.logout();
        }
      }
    }
  }

  private clearAutoLogout(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }
}
