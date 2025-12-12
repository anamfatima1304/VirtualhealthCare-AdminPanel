import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthcareTest } from '../../Data/tests.service';
import { HealthTest } from '../../Interfaces/Tests.interface';
import { Department } from '../../Interfaces/Department.interface';
import { DepartmentService } from '../../Data/departments.service';

@Component({
  selector: 'app-test-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-component.html',
  styleUrls: ['./test-component.css']
})
export class TestManagementComponent implements OnInit {
  tests: HealthTest[] = [];
  showAddModal = false;
  editingTest: HealthTest | null = null;
  
  departments: Department[] = [];
  
  newTest: HealthTest = {
    id: 0,
    name: '',
    price: 0,
    department: '',
    availableTimeSlots: []
  };
  
  newTimeSlot = '';
  
  constructor(private healthcareTestService: HealthcareTest, private departmentService: DepartmentService) {}
  
  ngOnInit() {
    this.loadDepartments();
    this.loadTests();
  }
  
  loadDepartments() {
    this.departments = this.departmentService.departments;
  }
  
  loadTests() {
    this.tests = this.healthcareTestService.healthcareTests;
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
      alert('Please fill in all required fields');
      return;
    }
    
    if (this.editingTest) {
      // Update existing test
      const index = this.tests.findIndex(t => t.id === this.editingTest!.id);
      if (index !== -1) {
        this.tests[index] = { ...this.newTest, id: this.editingTest.id };
      }
    } else {
      // Add new test
      const maxId = this.tests.length > 0 ? Math.max(...this.tests.map(t => t.id)) : 0;
      this.newTest.id = maxId + 1;
      this.tests.push({ ...this.newTest });
    }
    
    this.closeModal();
  }
  
  deleteTest(id: number) {
    if (confirm('Are you sure you want to delete this test?')) {
      const index = this.tests.findIndex(t => t.id === id);
      if (index !== -1) {
        this.tests.splice(index, 1);
      }
    }
  }
}