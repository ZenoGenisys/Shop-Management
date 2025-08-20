import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Sidenav } from '../sidenav/sidenav';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    Sidenav,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  sidenavOpened = signal(window.innerWidth > 768);

  toggleSidenav() {
    this.sidenavOpened.update(opened => !opened);
  }
}
