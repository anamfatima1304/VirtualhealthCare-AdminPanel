import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../Data/departments.service';
import { DoctorsService } from '../../Data/doctors.service';
import { Department } from '../../Interfaces/Department.interface';

@Component({
  selector: 'app-department-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './department-component.html',
  styleUrls: ['./department-component.css'], // fixed typo: styleUrl -> styleUrls
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  showModal = false;
  editingDepartment: Department | null = null;

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
    private doctorsService: DoctorsService
  ) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.departments = this.departmentService.departments;

    // Dynamically set specialists count for each department
    this.departments.forEach(dept => {
      dept.specialists = this.getSpecialistCount(dept.name);
    });
  }

  // Method to count doctors for a given department
  getSpecialistCount(departmentName: string): number {
    return this.doctorsService.doctors.filter(
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
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingDepartment) {
      // Update existing department
      const index = this.departments.findIndex(d => d.id === this.editingDepartment!.id);
      if (index !== -1) {
        this.departments[index] = { ...this.newDepartment, id: this.editingDepartment.id };
        // Update specialists count
        this.departments[index].specialists = this.getSpecialistCount(this.newDepartment.name);
      }
    } else {
      // Add new department
      const maxId = this.departments.length > 0 ? Math.max(...this.departments.map(d => d.id)) : 0;
      this.newDepartment.id = maxId + 1;
      this.newDepartment.specialists = this.getSpecialistCount(this.newDepartment.name);
      this.departments.push({ ...this.newDepartment });
    }

    this.closeModal();
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      const index = this.departments.findIndex(d => d.id === id);
      if (index !== -1) {
        this.departments.splice(index, 1);
      }
    }
  }
}
