import { Routes } from '@angular/router';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';

export const routes: Routes = [
    { path: 'home', component: EmployeeListComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];
