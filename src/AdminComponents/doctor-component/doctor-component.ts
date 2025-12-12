import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Doctor } from '../../Interfaces/Doctor.interface';
import { DoctorsService } from '../../Data/doctors.service';

@Component({
  selector: 'app-doctor-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-component.html',
  styleUrl: './doctor-component.css',
})
export class DoctorManagementComponent implements OnInit {
  doctors: any[] = [];
  showAddModal = false;
  showDetailsModal = false;
  selectedDoctor: any = null;
  
  newDoctor = {
    username: '',
    password: '',
    name: ''
  };

  constructor(private doctorsService: DoctorsService) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    // Add dummy credentials to existing doctors for demo
    this.doctors = this.doctorsService.doctors.map(doc => ({
      ...doc,
      username: `${doc.name.toLowerCase().replace(/\s+/g, '').replace('dr.', '')}`,
      password: 'doctor123'
    }));
  }

  openAddModal() {
    this.resetForm();
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  openDetailsModal(doctor: any) {
    this.selectedDoctor = doctor;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedDoctor = null;
  }

  resetForm() {
    this.newDoctor = {
      username: '',
      password: '',
      name: ''
    };
  }

  addDoctor() {
    if (!this.newDoctor.username || !this.newDoctor.password || !this.newDoctor.name) {
      alert('Please fill in all fields');
      return;
    }

    const maxId = this.doctors.length > 0 ? Math.max(...this.doctors.map(d => d.id)) : 0;
    
    const newDoc = {
      id: maxId + 1,
      name: this.newDoctor.name,
      specialty: 'Not specified',
      experience: '0 years',
      education: 'To be updated',
      image: '',
      availableDays: [],
      shortBio: 'Profile to be completed by doctor',
      consultationFee: '$0',
      username: this.newDoctor.username,
      password: this.newDoctor.password
    };

    this.doctors.push(newDoc);
    alert('Doctor account created successfully!');
    this.closeAddModal();
  }

  deleteDoctor(id: number, event: Event) {
    event.stopPropagation();
    const doctor = this.doctors.find(d => d.id === id);
    if (confirm(`Are you sure you want to delete ${doctor?.name}?`)) {
      const index = this.doctors.findIndex(d => d.id === id);
      if (index !== -1) {
        this.doctors.splice(index, 1);
      }
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }
}