import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    BaseChartDirective
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

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2200, 2800, 2500, 3000, 3500, 3200, 4000],
        label: 'Sales',
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: '#2196f3',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        data: [1200, 1600, 1500, 1700, 1800, 1900, 2100],
        label: 'Expense',
        backgroundColor: 'rgba(255, 152, 0, 0.6)',
        borderColor: '#ff9800',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        data: [1000, 1200, 1000, 1300, 1700, 1300, 1900],
        label: 'Profit',
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: '#4caf50',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        grid: { display: false },
        stacked: false
        
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹ ${value}`
        }
      }
    }
  };

  constructor() {
    Chart.register(...registerables);
  }
}
