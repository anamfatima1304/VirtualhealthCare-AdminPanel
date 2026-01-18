import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { HealthcareTest } from '../../Data/tests.service';
import { HealthTest } from '../../Interfaces/Tests.interface';
import { Department } from '../../Interfaces/Department.interface';
import { DepartmentService } from '../../Data/departments.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-test-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-component.html',
  styleUrls: ['./test-component.css']
})
export class TestManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;
  
  tests: HealthTest[] = [];
  showAddModal = false;
  editingTest: HealthTest | null = null;
  isLoading = false;
  errorMessage = '';
  
  // Notification system
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  
  departments: Department[] = [];
  
  newTest: HealthTest = {
    id: 0,
    name: '',
    price: 0,
    department: '',
    availableTimeSlots: []
  };
  
  newTimeSlot = '';
  
  constructor(
    private healthcareTestService: HealthcareTest, 
    private departmentService: DepartmentService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Only subscribe to router events in the browser
    if (this.isBrowser) {
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          takeUntil(this.destroy$)
        )
        .subscribe((event) => {
          if (event.url.includes('/admin/tests')) {
            this.loadDepartments();
            this.loadTests();
          }
        });
    }
  }
  
  ngOnInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        this.loadDepartments();
        this.loadTests();
      }, 0);
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadDepartments() {
    // Fetch departments from API
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        // Fallback to local data if API fails
        this.departments = this.departmentService.departments;
        this.cdr.detectChanges();
      }
    });
  }
  
  loadTests() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Fetch tests from API
    this.healthcareTestService.getAllTests().subscribe({
      next: (data) => {
        this.tests = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading tests:', error);
        this.errorMessage = 'Failed to load tests. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  openAddModal() {
    this.resetForm();
    this.editingTest = null;
    this.showAddModal = true;
  }
  
  openEditModal(test: HealthTest) {
    this.editingTest = { ...test };
    this.newTest = { ...test, availableTimeSlots: [...test.availableTimeSlots] };
    this.showAddModal = true;
  }
  
  closeModal() {
    this.showAddModal = false;
    this.resetForm();
  }
  
  resetForm() {
    this.newTest = {
      id: 0,
      name: '',
      price: 0,
      department: '',
      availableTimeSlots: []
    };
    this.newTimeSlot = '';
  }
  
  addTimeSlot() {
    if (this.newTimeSlot.trim()) {
      this.newTest.availableTimeSlots.push(this.newTimeSlot.trim());
      this.newTimeSlot = '';
    }
  }
  
  removeTimeSlot(index: number) {
    this.newTest.availableTimeSlots.splice(index, 1);
  }
  
  saveTest() {
    if (!this.newTest.name || !this.newTest.department || this.newTest.price <= 0) {
      this.displayNotification('Please fill in all required fields', 'error');
      return;
    }
    
    if (this.newTest.availableTimeSlots.length === 0) {
      this.displayNotification('Please add at least one time slot', 'error');
      return;
    }
    
    this.isLoading = true;
    
    if (this.editingTest) {
      // Update existing test via API
      this.healthcareTestService.updateTest(this.editingTest.id, this.newTest).subscribe({
        next: (updatedTest) => {
          this.loadTests();
          this.closeModal();
          this.displayNotification('Test updated successfully!', 'success');
        },
        error: (error) => {
          console.error('Error updating test:', error);
          this.displayNotification('Failed to update test. Please try again.', 'error');
          this.isLoading = false;
        }
      });
    } else {
      // Create new test via API
      const maxId = this.tests.length > 0 ? Math.max(...this.tests.map(t => t.id)) : 0;
      this.newTest.id = maxId + 1;
      
      this.healthcareTestService.createTest(this.newTest).subscribe({
        next: (createdTest) => {
          this.loadTests();
          this.closeModal();
          this.displayNotification('Test added successfully!', 'success');
        },
        error: (error) => {
          console.error('Error creating test:', error);
          this.displayNotification('Failed to add test. Please try again.', 'error');
          this.isLoading = false;
        }
      });
    }
  }
  
  deleteTest(id: number) {
    if (confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      this.isLoading = true;
      
      this.healthcareTestService.deleteTest(id).subscribe({
        next: () => {
          this.loadTests();
          this.displayNotification('Test deleted successfully!', 'success');
        },
        error: (error) => {
          console.error('Error deleting test:', error);
          this.displayNotification('Failed to delete test. Please try again.', 'error');
          this.isLoading = false;
        }
      });
    }
  }
  
  // Display notification helper
  displayNotification(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
}