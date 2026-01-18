import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FeedbackService, Feedback } from '../../Data/feedback.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface DashboardStats {
  totalFeedbacks: number;
  recentFeedbacks: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard-component.html',
  styleUrls: ['./admin-dashboard-component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;
  
  currentDate = new Date();
  admin: Admin | null = null;
  feedbacks: Feedback[] = [];
  filteredFeedbacks: Feedback[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Dashboard stats
  stats: DashboardStats = {
    totalFeedbacks: 0,
    recentFeedbacks: 0
  };
  
  // Filter and pagination
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 5;
  
  // Selected feedback for detail view
  selectedFeedback: Feedback | null = null;
  showDetailModal = false;
  
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(
    private http: HttpClient,
    private feedbackService: FeedbackService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          takeUntil(this.destroy$)
        )
        .subscribe((event) => {
          if (event.url.includes('/admin/dashboard')) {
            this.loadDashboardData();
          }
        });
    }
  }
  
  ngOnInit() {
    if (this.isBrowser) {
      this.loadAdminData();
      setTimeout(() => {
        this.loadDashboardData();
      }, 0);
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadAdminData() {
    if (!this.isBrowser) return;
    
    // Load admin data from localStorage (set during login)
    const adminData = localStorage.getItem('adminData');
    
    if (adminData) {
      this.admin = JSON.parse(adminData);
      this.cdr.detectChanges();
    } else {
      // No admin data found, redirect to login
      this.router.navigate(['/admin/login']);
    }
  }
  
  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.feedbackService.getAllFeedback()
      .subscribe({
        next: (data) => {
          this.feedbacks = data.map(fb => ({
            ...fb,
            createdAt: fb.createdAt ? new Date(fb.createdAt) : new Date(),
            updatedAt: fb.updatedAt ? new Date(fb.updatedAt) : new Date()
          }));
          
          this.filteredFeedbacks = [...this.feedbacks];
          this.calculateStats();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading feedbacks:', error);
          this.errorMessage = 'Failed to load feedbacks. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
  
  calculateStats() {
    this.stats.totalFeedbacks = this.feedbacks.length;
    
    // Count feedbacks from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.stats.recentFeedbacks = this.feedbacks.filter(
      fb => fb.createdAt && new Date(fb.createdAt) > sevenDaysAgo
    ).length;
  }
  
  searchFeedbacks() {
    if (!this.searchQuery.trim()) {
      this.filteredFeedbacks = [...this.feedbacks];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredFeedbacks = this.feedbacks.filter(fb =>
        fb.name.toLowerCase().includes(query) ||
        fb.email.toLowerCase().includes(query) ||
        fb.message.toLowerCase().includes(query)
      );
    }
    this.currentPage = 1;
  }
  
  get paginatedFeedbacks(): Feedback[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredFeedbacks.slice(startIndex, endIndex);
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredFeedbacks.length / this.itemsPerPage);
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  goToPage(page: number) {
    this.currentPage = page;
  }
  
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  openFeedbackDetail(feedback: Feedback) {
    this.selectedFeedback = feedback;
    this.showDetailModal = true;
  }
  
  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedFeedback = null;
  }
  
  deleteFeedback(id: number | undefined) {
    if (!id) {
      alert('Invalid feedback ID');
      return;
    }
    
    if (confirm('Are you sure you want to delete this feedback?')) {
      this.feedbackService.deleteFeedback(id).subscribe({
        next: () => {
          this.loadDashboardData();
          this.closeDetailModal();
        },
        error: (error) => {
          console.error('Error deleting feedback:', error);
          alert('Failed to delete feedback. Please try again.');
        }
      });
    }
  }
  
  getTimeAgo(date: Date | undefined): string {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}