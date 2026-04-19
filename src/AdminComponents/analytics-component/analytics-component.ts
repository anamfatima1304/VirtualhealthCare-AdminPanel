import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

interface Department {
  id: number;
  name: string;
  description: string;
  icon?: string;
  services: string[];
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  education: string;
  image?: string;
  availableDays: string[];
  consultationFee: string;
}

interface Appointment {
  id: number;
  doctorId: number;
  patientName: string;
  appointmentDate: string;
  time: string;
  priority: string;
  status: string;
}

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-component.html',
  styleUrls: ['./analytics-component.css']
})
export class AnalyticsComponent implements OnInit {
  departments: Department[] = [];
  doctors: Doctor[] = [];
  appointments: Appointment[] = [];
  availableDoctors: Doctor[] = [];
  filteredAppointments: Appointment[] = [];

  selectedDepartment = 'All Departments';
  selectedDoctor = 'All Doctors';
  dateFrom = '';
  dateTo = '';

  isLoading = false;
  errorMessage = '';

  readonly apiUrl = 'http://localhost:3000/api';
  readonly chartColors = ['#1F4E79', '#3B7A99', '#6FA3D8', '#A4C8E1', '#729FD6', '#294B78'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  async loadAnalytics(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const [departmentResponse, doctorResponse, appointmentResponse] = await Promise.all([
        firstValueFrom(this.http.get<ApiResponse<Department>>(`${this.apiUrl}/departments`)),
        firstValueFrom(this.http.get<ApiResponse<Doctor>>(`${this.apiUrl}/doctors`)),
        firstValueFrom(this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/appointments`))
      ]);

      this.departments = departmentResponse.data || [];
      this.doctors = doctorResponse.data || [];
      this.appointments = appointmentResponse.data || [];
      this.availableDoctors = [...this.doctors];
      this.updateFilters();
    } catch (error) {
      console.error('Analytics load error:', error);
      this.errorMessage = 'Unable to load analytics data. Please make sure the backend is running and try again.';
    } finally {
      this.isLoading = false;
    }
  }

  onDepartmentChange(): void {
    this.availableDoctors = this.getDoctorsForSelectedDepartment();

    if (
      this.selectedDoctor !== 'All Doctors' &&
      !this.availableDoctors.some(doc => doc.id === Number(this.selectedDoctor))
    ) {
      this.selectedDoctor = 'All Doctors';
    }

    this.updateFilters();
  }

  updateFilters(): void {
    const startDate = this.dateFrom ? new Date(this.dateFrom) : null;
    const endDate = this.dateTo ? new Date(this.dateTo) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    const departmentDoctorIds = this.getDepartmentDoctorIds(this.selectedDepartment);

    this.filteredAppointments = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);

      if (startDate && appointmentDate < startDate) {
        return false;
      }

      if (endDate && appointmentDate > endDate) {
        return false;
      }

      if (this.selectedDoctor !== 'All Doctors' && appointment.doctorId !== Number(this.selectedDoctor)) {
        return false;
      }

      if (this.selectedDepartment !== 'All Departments' && !departmentDoctorIds.includes(appointment.doctorId)) {
        return false;
      }

      return true;
    });
  }

  getDoctorsForSelectedDepartment(): Doctor[] {
    if (this.selectedDepartment === 'All Departments') {
      return [...this.doctors];
    }

    const departmentKey = this.selectedDepartment.toLowerCase();
    return this.doctors.filter(doctor => {
      const specialty = doctor.specialty.toLowerCase();
      return specialty.includes(departmentKey) || departmentKey.includes(specialty);
    });
  }

  getDepartmentDoctorIds(department: string): number[] {
    if (department === 'All Departments') {
      return this.doctors.map(doc => doc.id);
    }

    return this.getDoctorsForSelectedDepartment().map(doc => doc.id);
  }

  get departmentOptions(): string[] {
    return ['All Departments', ...this.departments.map(dept => dept.name)];
  }

  get doctorOptions(): SelectOption[] {
    return [
      { label: 'All Doctors', value: 'All Doctors' },
      ...this.availableDoctors.map(doc => ({ label: doc.name, value: String(doc.id) }))
    ];
  }

  get totalDepartments(): number {
    return this.departments.length;
  }

  get totalDoctors(): number {
    return this.doctors.length;
  }

  get appointmentStatusData(): Array<{ label: string; value: number; percentage: number; color: string }> {
    const counts = this.countBy(this.filteredAppointments, 'status');
    const order = ['pending', 'confirmed', 'completed', 'cancelled'];

    return order
      .filter(label => counts[label])
      .map((label, index) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: counts[label],
        percentage: this.getPercentage(counts[label], this.filteredAppointments.length),
        color: this.chartColors[index % this.chartColors.length]
      }));
  }

  get appointmentPriorityData(): Array<{ label: string; value: number; color: string }> {
    const counts = this.countBy(this.filteredAppointments, 'priority');
    const order = ['High', 'Medium', 'Normal'];

    return order
      .filter(label => counts[label])
      .map((label, index) => ({
        label,
        value: counts[label],
        color: this.chartColors[index % this.chartColors.length]
      }));
  }

  get appointmentsByDoctorData(): Array<{ label: string; value: number; color: string }> {
    const counts = this.filteredAppointments.reduce((acc, appointment) => {
      const doctor = this.doctors.find(doc => doc.id === appointment.doctorId);
      const label = doctor ? doctor.name : `Doctor ${appointment.doctorId}`;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value], index) => ({
        label,
        value,
        color: this.chartColors[index % this.chartColors.length]
      }));
  }

  get doctorSpecialtyData(): Array<{ label: string; value: number; color: string }> {
    const doctorList = this.selectedDepartment === 'All Departments' ? this.doctors : this.getDoctorsForSelectedDepartment();
    const counts = doctorList.reduce((acc, doctor) => {
      acc[doctor.specialty] = (acc[doctor.specialty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], index) => ({
        label,
        value,
        color: this.chartColors[index % this.chartColors.length]
      }));
  }

  get departmentServiceData(): Array<{ label: string; value: number; color: string }> {
    return this.departments.map((department, index) => ({
      label: department.name,
      value: department.services?.length || 0,
      color: this.chartColors[index % this.chartColors.length]
    }));
  }

  get appointmentTrendData(): Array<{ label: string; value: number }> {
    const counts = this.filteredAppointments.reduce((acc, appointment) => {
      const dateKey = new Date(appointment.appointmentDate).toISOString().slice(0, 10);
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([label, value]) => ({ label, value }));
  }

  get lineChartPath(): string {
    const trend = this.appointmentTrendData;
    if (!trend.length) {
      return '';
    }

    const width = 260;
    const height = 120;
    const padding = 20;
    const max = Math.max(...trend.map(item => item.value), 1);
    const stepX = (width - padding * 2) / Math.max(trend.length - 1, 1);

    return trend
      .map((point, index) => {
        const x = padding + stepX * index;
        const y = height - padding - (point.value / max) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  get lineChartPoints(): string {
    const trend = this.appointmentTrendData;
    if (!trend.length) {
      return '';
    }

    const width = 260;
    const height = 120;
    const padding = 20;
    const max = Math.max(...trend.map(item => item.value), 1);
    const stepX = (width - padding * 2) / Math.max(trend.length - 1, 1);

    return trend
      .map((point, index) => {
        const x = padding + stepX * index;
        const y = height - padding - (point.value / max) * (height - padding * 2);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  get lineLabels(): string[] {
    return this.appointmentTrendData.map(item => item.label.replace(/-/g, '/'));
  }

  // ── Template helper methods ────────────────────────────────────────────────

  /** Returns the max value from any data array, or 1 to avoid division by zero */
  getMaxValue(data: { value: number }[]): number {
    return data.length ? Math.max(...data.map(d => d.value)) : 1;
  }

  /** cx coordinate for the i-th dot on the line chart */
  getLineCx(i: number): number {
    const denominator = this.lineLabels.length > 1 ? this.lineLabels.length - 1 : 1;
    return 20 + i * (240 / denominator);
  }

  /** cy coordinate for a dot given its value and the dataset max */
  getLinePointCy(value: number, maxValue: number): number {
    return 120 - 20 - ((value / Math.max(maxValue, 1)) * 80);
  }

  /** Width percentage for a bar given its value and the dataset max */
  getBarWidth(value: number, maxValue: number): number {
    return (value / Math.max(maxValue, 1)) * 100;
  }

  // ── Private utilities ──────────────────────────────────────────────────────

  private countBy(items: Appointment[], key: keyof Appointment): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = String(item[key] ?? 'Unknown');
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getPercentage(value: number, total: number): number {
    return total === 0 ? 0 : Math.round((value / total) * 100);
  }
}