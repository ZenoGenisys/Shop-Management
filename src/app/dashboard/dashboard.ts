import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  stats = [
    { title: 'Profit', value: '₹ 12,345', icon: 'attach_money', color: '#4caf50', change: '+12%' },
    { title: 'Total Sales', value: '₹ 156', icon: 'shopping_cart', color: '#2196f3', change: '+8%' },
    { title: 'Expense', value: '₹ 89', icon: 'people', color: '#ff9800', change: '+15%' },
  ];
}
