import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: Admin;
  token?: string;
}


@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login-component.html',
  styleUrls: ['./admin-login-component.css']
})
export class AdminLoginComponent {
  private isBrowser: boolean;
  
  loginData = {
    email: '',
    password: ''
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Check if already logged in
    if (this.isBrowser) {
      const adminData = localStorage.getItem('adminData');
      const adminToken = localStorage.getItem('adminToken');
      
      if (adminData && adminToken) {
        // Already logged in, redirect to dashboard
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }

  onLogin() {
    // Validation
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Call login API
    this.http.post<LoginResponse>(`${this.apiUrl}/admins/login`, this.loginData)
      .subscribe({
        next: (response) => {
          console.log('FULL LOGIN RESPONSE:', response);
          if (response.success && response.data) {
            const admin = response.data;
          
            this.successMessage = 'Login successful! Redirecting...';
          
            if (this.isBrowser) {
              localStorage.setItem('adminData', JSON.stringify(admin));
            }
          
            setTimeout(() => {
              this.router.navigate(['/admin/dashboard']);
            }, 1000);
          }
           else {
            this.errorMessage = response.message || 'Login failed. Please try again.';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
        }
      });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}