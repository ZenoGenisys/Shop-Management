import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

let hasShownSessionExpired = false;

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);
  const token = authService.getStoredToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest = req.url.endsWith('/login');

      if (error.status === 401 && !isAuthRequest) {
        if (!hasShownSessionExpired) {
          hasShownSessionExpired = true;
          snackBar.open('Your session has expired. Please log in again.', 'Close', {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-top-right'],
          });
          authService.logout();
          setTimeout(() => {
            hasShownSessionExpired = false;
          }, 5000);
        }
      }

      return throwError(() => error);
    })
  );
};
