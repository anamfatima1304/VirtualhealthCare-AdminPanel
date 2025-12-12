import { Injectable } from '@angular/core';
import { HealthTest } from '../Interfaces/Tests.interface';

@Injectable({
  providedIn: 'root'
})
export class HealthcareTest {
  healthcareTests: HealthTest[] = [
    {
      id: 1,
      name: 'Complete Blood Count (CBC)',
      price: 25,
      department: 'Hematology',
      availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 2-5 PM']
    },
    {
      id: 2,
      name: 'Chest X-Ray',
      price: 80,
      department: 'Radiology',
      availableTimeSlots: ['Morning 9-12 PM', 'Evening 3-6 PM']
    },
    {
      id: 3,
      name: 'Lipid Profile',
      price: 35,
      department: 'Biochemistry',
      availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 1-4 PM', 'Evening 5-7 PM']
    },
    {
      id: 4,
      name: 'ECG (Electrocardiogram)',
      price: 45,
      department: 'Cardiology',
      availableTimeSlots: ['Morning 9-12 PM', 'Afternoon 2-5 PM']
    },
    {
      id: 5,
      name: 'Thyroid Function Test',
      price: 55,
      department: 'Endocrinology',
      availableTimeSlots: ['Morning 8-10 AM', 'Late Morning 10-12 PM']
    },
    {
      id: 6,
      name: 'Ultrasound Abdomen',
      price: 120,
      department: 'Radiology',
      availableTimeSlots: ['Morning 10-12 PM', 'Afternoon 2-4 PM', 'Evening 4-6 PM']
    },
    {
      id: 7,
      name: 'Blood Sugar Test',
      price: 15,
      department: 'Biochemistry',
      availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 2-5 PM']
    },
    {
      id: 8,
      name: 'Urine Analysis',
      price: 20,
      department: 'Pathology',
      availableTimeSlots: ['Morning 8-12 PM', 'Afternoon 1-5 PM']
    }
  ];
}
