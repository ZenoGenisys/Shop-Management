import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../auth.service';
import { Subscription } from 'rxjs';

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

  currentUser: User | null = null;
  private userSubscription: Subscription | null = null;

  constructor(readonly authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

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
