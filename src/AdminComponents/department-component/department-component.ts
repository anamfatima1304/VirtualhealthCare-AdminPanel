import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { DepartmentService } from '../../Data/departments.service';
import { DoctorsService } from '../../Data/doctors.service';
import { Department } from '../../Interfaces/Department.interface';
import { Doctor } from '../../Interfaces/Doctor.interface';
import { forkJoin, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-department-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './department-component.html',
  styleUrls: ['./department-component.css'],
})
export class DepartmentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;
  
  departments: Department[] = [];
  doctors: Doctor[] = [];
  showModal = false;
  editingDepartment: Department | null = null;
  isLoading = false;
  errorMessage = '';

  // Notification system
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  newDepartment: Department = {
    id: 0,
    name: '',
    description: '',
    icon: '',
    services: [],
    specialists: 0
  };

  newService = '';

  constructor(
    private departmentService: DepartmentService,
    private doctorsService: DoctorsService,
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
          console.log('Navigation detected:', event.url);
          if (event.url.includes('/admin/departments')) {
            console.log('Reloading departments data...');
            this.loadData();
          }
        });
    }
  }

  ngOnInit() {
    console.log('ngOnInit called, isBrowser:', this.isBrowser);
    if (this.isBrowser) {
      // Add a small delay to ensure the component is fully initialized
      setTimeout(() => {
        this.loadData();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    console.log('loadData called');
    this.isLoading = true;
    this.errorMessage = '';

    // Fetch both departments and doctors simultaneously
    forkJoin({
      departments: this.departmentService.getAllDepartments(),
      doctors: this.doctorsService.getAllDoctors()
    }).subscribe({
      next: (data) => {
        console.log('Data loaded:', data);
        console.log('Departments count:', data.departments.length);
        console.log('Doctors count:', data.doctors.length);
        
        this.departments = data.departments;
        this.doctors = data.doctors;
        
        // Calculate specialist count for each department
        this.departments.forEach(dept => {
          dept.specialists = this.getSpecialistCount(dept.name);
        });
        
        this.isLoading = false;
        
        // Force change detection
        this.cdr.detectChanges();
        
        console.log('After assignment - departments:', this.departments);
        console.log('After assignment - doctors:', this.doctors);
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.errorMessage = 'Failed to load data. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Method to count doctors for a given department
  getSpecialistCount(departmentName: string): number {
    return this.doctors.filter(
      doctor => doctor.specialty === departmentName
    ).length;
  }

  openAddModal() {
    this.resetForm();
    this.editingDepartment = null;
    this.showModal = true;
  }

  openEditModal(department: Department) {
    this.editingDepartment = { ...department };
    this.newDepartment = { ...department, services: [...department.services] };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newDepartment = {
      id: 0,
      name: '',
      description: '',
      icon: '',
      services: [],
      specialists: 0
    };
    this.newService = '';
  }

  addService() {
    if (this.newService.trim()) {
      this.newDepartment.services.push(this.newService.trim());
      this.newService = '';
    }
  }

  removeService(index: number) {
    this.newDepartment.services.splice(index, 1);
  }

  saveDepartment() {
    if (!this.newDepartment.name || !this.newDepartment.description) {
      this.displayNotification('Please fill in all required fields', 'error');
      return;
    }

    if (this.newDepartment.services.length === 0) {
      this.displayNotification('Please add at least one service', 'error');
      return;
    }

    this.isLoading = true;

    if (this.editingDepartment) {
      // Update existing department via API
      this.departmentService.updateDepartment(this.editingDepartment.id, this.newDepartment).subscribe({
        next: (updatedDept) => {
          this.loadData();
          this.closeModal();
          this.displayNotification('Department updated successfully!', 'success');
        },
        error: (error) => {
          console.error('Error updating department:', error);
          this.displayNotification('Failed to update department. Please try again.', 'error');
          this.isLoading = false;
        }
      });
    } else {
      // Create new department via API
      const maxId = this.departments.length > 0 ? Math.max(...this.departments.map(d => d.id)) : 0;
      this.newDepartment.id = maxId + 1;
      // Specialist count will be calculated after fetching
      this.newDepartment.specialists = 0;

      this.departmentService.createDepartment(this.newDepartment).subscribe({
        next: (createdDept) => {
          this.loadData();
          this.closeModal();
          this.displayNotification('Department added successfully!', 'success');
        },
        error: (error) => {
          console.error('Error creating department:', error);
          this.displayNotification('Failed to add department. Please try again.', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      this.isLoading = true;

      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.loadData();
          this.displayNotification('Department deleted successfully!', 'success');
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          this.displayNotification('Failed to delete department. Please try again.', 'error');
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