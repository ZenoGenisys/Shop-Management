
import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './dashboard/dashboard';
import { Reports } from './reports/reports';
import { Login } from './login/login';
import { AuthGuard } from './services/auth.guard';
import { AddDataComponent } from './add-data/add-data';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'reports',
        component: Reports
      },
      {
        path: 'add-data',
        component: AddDataComponent
      }
    ]
  }
];
