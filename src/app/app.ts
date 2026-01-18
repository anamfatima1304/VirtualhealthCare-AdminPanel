import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Header } from '../AdminComponents/Shared/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AdminPanel');
  currentRoute = '';

  constructor(private router: Router) {
    // Track route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  isLoginPage(): boolean {
    return this.currentRoute === '/admin/login' || this.currentRoute === '/';
  }
}
