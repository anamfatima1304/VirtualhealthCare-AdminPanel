import { Routes } from '@angular/router';
import { DepartmentComponent } from '../AdminComponents/department-component/department-component';
// import { DoctorManagementComponent } from '../AdminComponents/doctor-component/doctor-component';
import { TestManagementComponent } from '../AdminComponents/test-component/test-component';
import { AdminDashboardComponent } from '../AdminComponents/admin-dashboard-component/admin-dashboard-component';
import { AdminLoginComponent } from '../AdminComponents/admin-login-component/admin-login-component';
import { AdminDoctorsComponent } from '../AdminComponents/doctor-component/doctor-component';
import { EditDoctorComponent } from '../AdminComponents/edit-doctor/edit-doctor';
// import { EditDoctorsComponent } from '../DoctorComponents/edit-doctors-component/edit-doctors-component';

export const routes: Routes = [
    { path: '', redirectTo: '/admin/login', pathMatch: 'full' },
    { path: 'admin/tests', component: TestManagementComponent },
    { path: 'admin/departments', component: DepartmentComponent },
    { path: 'admin/doctors', component: AdminDoctorsComponent },
    { path: 'admin/doctors/edit/:id', component: EditDoctorComponent },
    { path: 'admin/dashboard',component: AdminDashboardComponent},
    { path: 'admin/login',component: AdminLoginComponent},
    // {
    //     path: 'admin/doctors',
    //     component: AdminDoctorsComponent
    //   },
    //   {
    //     path: 'admin/doctors/edit/:id',
    //     component: EditDoctorComponent
    //   }
];
