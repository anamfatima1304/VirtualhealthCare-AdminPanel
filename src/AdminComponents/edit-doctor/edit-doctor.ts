import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorsService } from '../../Data/doctors.service';
import { Department } from '../../Interfaces/Department.interface';
import { Doctor } from '../../Interfaces/Doctor.interface';
import { DepartmentService } from '../../Data/departments.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-doctor',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-doctor.html',
  styleUrls: ['./edit-doctor.css']
})

export class EditDoctorComponent implements OnInit {
  doctorId!: number;
  doctor: Doctor | null = null;
  departments: Department[] = [];
  loading = false;
  saving = false;
  uploadingImage = false;
  
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  editForm = {
    name: '',
    specialty: '',
    departmentId: null as number | null,
    experience: '',
    education: '',
    image: '',
    shortBio: '',
    consultationFee: ''
  };
  
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorsService: DoctorsService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    console.log('EditDoctorComponent initialized - CLEAN VERSION');
    this.route.params.subscribe(params => {
      this.doctorId = +params['id'];
      console.log('Doctor ID:', this.doctorId);
      if (this.doctorId) {
        this.loadDoctor();
        this.loadDepartments();
      }
    });
  }

  loadDoctor(): void {
    console.log('Loading doctor...');
    this.loading = true;
    this.doctor = null;
    
    this.doctorsService.getDoctorById(this.doctorId).subscribe({
      next: (data) => {
        console.log('SUCCESS - Doctor loaded:', data);
        this.doctor = data;
        this.populateForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('ERROR loading doctor:', err);
        this.showError('Failed to load doctor');
        this.loading = false;
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments = data || [];
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
  }

  populateForm(): void {
    if (!this.doctor) return;
    
    const deptId = (this.doctor as any).departmentId;
    
    this.editForm = {
      name: this.doctor.name || '',
      specialty: this.doctor.specialty || '',
      departmentId: typeof deptId === 'string' ? parseInt(deptId) : deptId,
      experience: this.doctor.experience || '',
      education: this.doctor.education || '',
      image: this.doctor.image || '',
      shortBio: this.doctor.shortBio || '',
      consultationFee: this.doctor.consultationFee || ''
    };
  }

  updateDoctor(): void {
    if (!this.editForm.name || !this.editForm.specialty) {
      this.showError('Name and specialty are required');
      return;
    }

    this.saving = true;

    const updated: any = {
      ...this.doctor,
      name: this.editForm.name,
      specialty: this.editForm.specialty,
      departmentId: this.editForm.departmentId,
      experience: this.editForm.experience,
      education: this.editForm.education,
      image: this.editForm.image,
      shortBio: this.editForm.shortBio,
      consultationFee: this.editForm.consultationFee
    };

    this.doctorsService.updateDoctor(this.doctorId, updated).subscribe({
      next: (data) => {
        this.doctor = data;
        this.showSuccess('Doctor updated successfully!');
        this.saving = false;
        setTimeout(() => this.goBack(), 1500);
      },
      error: (err) => {
        console.error('Error updating:', err);
        this.showError('Failed to update doctor');
        this.saving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/doctors']);
  }

  isDayAvailable(day: string): boolean {
    return this.doctor?.availableDays?.includes(day) || false;
  }

  getTimeSlotsForDay(day: string): any[] {
    return this.doctor?.timeSlots?.filter(slot => slot.day === day) || [];
  }

  onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showError('Image size should be less than 5MB');
      return;
    }

    this.uploadingImage = true;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.editForm.image = e.target.result;
      this.uploadingImage = false;
      this.showSuccess('Image uploaded successfully!');
    };
    reader.onerror = () => {
      this.showError('Failed to read image file');
      this.uploadingImage = false;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.editForm.image = 'placeholder';
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }
}