import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorsService } from '../../Data/doctors.service';
import { CredentialsService } from '../../Data/credentials.service';
import { DepartmentService } from '../../Data/departments.service';
import { Doctor } from '../../Interfaces/Doctor.interface';
import { Department } from '../../Interfaces/Department.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-doctors',
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-component.html',
  styleUrls: ['./doctor-component.css']
})

export class AdminDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  departments: Department[] = [];
  doctorCredentials: Map<number, any> = new Map(); // Store credentials for each doctor
  loading = false;
  
  // Add Doctor Modal
  showAddModal = false;
  addForm = {
    username: '',
    password: '',
    departmentId: null as number | null
  };
  
  // Delete Confirmation Modal
  showDeleteModal = false;
  doctorToDelete: Doctor | null = null;
  
  // Error/Success Messages
  errorMessage = '';
  successMessage = '';

  constructor(
    private doctorsService: DoctorsService,
    private credentialsService: CredentialsService,
    private departmentService: DepartmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('AdminDoctorsComponent initialized');
    this.loadDoctors();
    this.loadDepartments();
  }

  loadDoctors(): void {
    console.log('Starting to load doctors...');
    this.loading = true;
    this.doctors = []; // Clear existing data
    this.cdr.detectChanges(); // Force update
    
    this.doctorsService.getAllDoctors().subscribe({
      next: (data) => {
        console.log('Doctors loaded successfully:', data);
        this.doctors = data || [];
        // Load credentials for each doctor
        if (this.doctors.length > 0) {
          this.loadAllCredentials();
        }
        this.loading = false;
        this.cdr.detectChanges(); // Force update
        console.log('Loading complete. Loading state:', this.loading);
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.showError('Failed to load doctors');
        this.doctors = [];
        this.loading = false;
        this.cdr.detectChanges(); // Force update
        console.log('Loading complete with error. Loading state:', this.loading);
      }
    });
  }

  loadAllCredentials(): void {
    // Load credentials for all doctors
    this.doctors.forEach(doctor => {
      this.credentialsService.getCredentialsByDoctorId(doctor.id).subscribe({
        next: (credential) => {
          this.doctorCredentials.set(doctor.id, credential);
        },
        error: (err) => {
          console.error(`Error loading credentials for doctor ${doctor.id}:`, err);
          // Set a placeholder if credentials can't be loaded
          this.doctorCredentials.set(doctor.id, { username: 'N/A' });
        }
      });
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments = data || [];
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.departments = [];
      }
    });
  }

  // Open Add Modal
  openAddModal(): void {
    this.showAddModal = true;
    this.resetAddForm();
    this.clearMessages();
  }

  // Close Add Modal
  closeAddModal(): void {
    this.showAddModal = false;
    this.resetAddForm();
    this.clearMessages();
  }

  // Reset Add Form
  resetAddForm(): void {
    this.addForm = {
      username: '',
      password: '',
      departmentId: null
    };
  }

  // Add Doctor
  addDoctor(): void {
    // Validation
    if (!this.addForm.username || !this.addForm.password || !this.addForm.departmentId) {
      this.showError('Please fill in all fields');
      return;
    }

    // Convert departmentId to number if it's a string
    const deptId = typeof this.addForm.departmentId === 'string' 
      ? parseInt(this.addForm.departmentId) 
      : this.addForm.departmentId;

    const selectedDepartment = this.departments.find(d => d.id === deptId);
    if (!selectedDepartment) {
      this.showError('Invalid department selected');
      console.log('Department ID:', deptId, 'Available departments:', this.departments);
      return;
    }

    this.loading = true;

    // Generate a temporary ID (will be replaced by backend if auto-generated)
    const tempId = Date.now(); // Using timestamp as temporary unique ID

    // Create basic doctor object with required fields
    const newDoctor: any = {
      id: tempId, // Add temporary ID
      name: this.addForm.username, // Temporary, will be updated later
      specialty: selectedDepartment.name,
      departmentId: deptId,
      experience: 'Not specified',
      education: 'Not specified',
      image: 'placeholder', // Use 'placeholder' string instead of empty
      availableDays: [],
      timeSlots: [],
      shortBio: 'No bio available yet.',
      consultationFee: 'Rs. 0' // Required field
    };

    // First create the doctor
    this.doctorsService.createDoctor(newDoctor).subscribe({
      next: (createdDoctor) => {
        // Then create credentials
        const credentialData = {
          doctorId: createdDoctor.id,
          username: this.addForm.username,
          password: this.addForm.password
        };

        this.credentialsService.createCredentials(credentialData).subscribe({
          next: () => {
            this.showSuccess('Doctor added successfully!');
            this.closeAddModal();
            this.loadDoctors();
            this.loading = false;
          },
          error: (err) => {
            console.error('Error creating credentials:', err);
            this.showError('Doctor created but failed to create credentials');
            this.loading = false;
            this.loadDoctors();
          }
        });
      },
      error: (err) => {
        console.error('Error creating doctor:', err);
        this.showError('Failed to add doctor');
        this.loading = false;
      }
    });
  }

  // Edit Doctor (Navigate to Edit Page)
  editDoctor(doctorId: number): void {
    this.router.navigate(['/admin/doctors/edit', doctorId]);
  }

  // Open Delete Modal
  openDeleteModal(doctor: Doctor): void {
    this.doctorToDelete = doctor;
    this.showDeleteModal = true;
    this.clearMessages();
  }

  // Close Delete Modal
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.doctorToDelete = null;
  }

  // Confirm Delete
  confirmDelete(): void {
    if (!this.doctorToDelete) return;

    this.loading = true;

    this.doctorsService.deleteDoctor(this.doctorToDelete.id).subscribe({
      next: () => {
        this.showSuccess('Doctor deleted successfully!');
        this.closeDeleteModal();
        this.loadDoctors();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error deleting doctor:', err);
        this.showError('Failed to delete doctor');
        this.loading = false;
      }
    });
  }

  // Get Department Name by ID
  getDepartmentName(departmentId: number): string {
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Not Assigned';
  }

  // Get Doctor Username
  getDoctorUsername(doctorId: number): string {
    const credential = this.doctorCredentials.get(doctorId);
    return credential ? credential.username : 'Loading...';
  }

  // Get Doctor Password (always return default)
  getDoctorPassword(): string {
    return 'Doctor@123';
  }

  // Show Error Message
  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  // Show Success Message
  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }

  // Clear Messages
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}