import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss'
})
export class Sidenav {
  @Input() opened = true;
  @Output() backdropClick = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Reports', icon: 'analytics', route: '/reports' },
  ];

  bottomNavItems: NavItem[] = [
    { label: 'Help', icon: 'help', route: '/help' },
    { label: 'Support', icon: 'support_agent', route: '/support' }
  ];

  onBackdropClick(): void {
    this.backdropClick.emit();
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
}
