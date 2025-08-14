import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements AfterViewInit {
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

  // Recent Sales Table
  displayedColumns: string[] = ['date', 'type', 'category', 'quantity', 'price', 'details', 'action'];

  recentSales: Array<{
    date: string; // ISO or display string
    type: 'Income' | 'Expense';
    category: 'Broiler' | 'Country Chicken';
    quantityKg: number;
    price: number;
    details: string;
  }> = [
    { date: '2025-08-10', type: 'Income', category: 'Broiler', quantityKg: 12, price: 1800, details: 'Walk-in customer' },
    { date: '2025-08-11', type: 'Expense', category: 'Country Chicken', quantityKg: 5, price: 600, details: 'Feed purchase' },
    { date: '2025-08-12', type: 'Income', category: 'Country Chicken', quantityKg: 8, price: 1520, details: 'Online order #1024' },
    { date: '2025-08-12', type: 'Expense', category: 'Broiler', quantityKg: 3, price: 350, details: 'Transport' },
    { date: '2025-08-13', type: 'Income', category: 'Broiler', quantityKg: 15, price: 2100, details: 'Retailer invoice #A19' }
  ];

  dataSource = new MatTableDataSource(this.recentSales);

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date':
          return new Date(item.date).getTime();
        case 'quantity':
          return item.quantityKg;
        case 'price':
          return item.price;
        case 'type':
          return item.type;
        case 'category':
          return item.category;
        case 'details':
          return item.details;
        default:
          return '' as any;
      }
    };
    this.dataSource.sort = this.sort;
  }

  onView(row: any): void {
    console.log('View', row);
  }

  onEdit(row: any): void {
    console.log('Edit', row);
  }

  onDelete(row: any): void {
    console.log('Delete', row);
  }
}
