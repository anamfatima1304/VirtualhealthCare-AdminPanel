import { Injectable } from '@angular/core';
import { Department } from '../Interfaces/Department.interface';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  departments: Department[] = [
    {
      id: 1,
      name: 'Cardiologist',
      description: 'Comprehensive heart care services including diagnosis, treatment, and prevention of cardiovascular diseases with state-of-the-art technology.',
      icon: 'fas fa-heartbeat',
      services: ['ECG', 'Echocardiography', 'Cardiac Catheterization', 'Heart Surgery', 'Pacemaker Implantation'],
      specialists: 1
    },
    {
      id: 2,
      name: 'Neurologist',
      description: 'Advanced neurological care for brain, spine, and nervous system disorders with cutting-edge diagnostic and treatment facilities.',
      icon: 'fas fa-brain',
      services: ['MRI Scans', 'EEG', 'Stroke Treatment', 'Epilepsy Care', 'Brain Surgery'],
      specialists: 1
    },
    {
      id: 3,
      name: 'Pediatrician',
      description: 'Dedicated healthcare for children from newborns to adolescents, providing comprehensive medical care in a child-friendly environment.',
      icon: 'fas fa-baby',
      services: ['Vaccinations', 'Growth Monitoring', 'Pediatric Surgery', 'NICU', 'Child Psychology'],
      specialists: 1
    },
    {
      id: 4,
      name: 'Orthopedic Surgeon',
      description: 'Complete bone, joint, and muscle care including sports medicine, joint replacement, and trauma surgery with rehabilitation services.',
      icon: 'fas fa-bone',
      services: ['Joint Replacement', 'Sports Medicine', 'Trauma Surgery', 'Physiotherapy', 'Arthroscopy'],
      specialists: 1
    },
    {
      id: 5,
      name: 'Dermatologist',
      description: 'Comprehensive skin care services including medical, surgical, and cosmetic dermatology with advanced laser treatments.',
      icon: 'fas fa-hand-paper',
      services: ['Skin Cancer Treatment', 'Cosmetic Procedures', 'Laser Therapy', 'Acne Treatment', 'Dermatologic Surgery'],
      specialists: 1
    },
    {
      id: 6,
      name: 'General Surgeon',
      description: 'Expert surgical care including minimally invasive procedures, emergency surgeries, and comprehensive operative management.',
      icon: 'fas fa-user-md',
      services: ['Appendectomy', 'Gallbladder Surgery', 'Hernia Repair', 'Emergency Surgery', 'Minimally Invasive Surgery'],
      specialists: 1
    },
    {
      id: 7,
      name: 'Just Another Department',
      description: 'Expert surgical care including minimally invasive procedures, emergency surgeries, and comprehensive operative management.',
      icon: 'fas fa-user-md',
      services: ['Appendectomy', 'Gallbladder Surgery', 'Hernia Repair', 'Emergency Surgery', 'Minimally Invasive Surgery'],
      specialists: 1
    }
  ];
}
