import { Routes } from '@angular/router';
import { DepartmentComponent } from '../AdminComponents/department-component/department-component';
import { DoctorManagementComponent } from '../AdminComponents/doctor-component/doctor-component';
import { TestManagementComponent } from '../AdminComponents/test-component/test-component';

export const routes: Routes = [
    { path: 'admin/tests', component: TestManagementComponent },
    { path: 'admin/departments', component: DepartmentComponent },
    { path: 'admin/doctors', component: DoctorManagementComponent }
];
