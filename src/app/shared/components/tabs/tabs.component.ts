import { Component, Input, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor, NgIf } from '@angular/common';
import { EmployeeDetails } from '../../models/employee.interface';
import { TableComponent } from '../table/table.component';

const materialModules = [
  MatTabsModule
];

const commonModules = [
  NgFor, NgIf
]

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [...materialModules,...commonModules,TableComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent implements OnInit {
  @Input() employeesList: EmployeeDetails[] = [];

  tabDefs: any[] = [
    { label: 'All Employees', status: 'All' },
    { label: 'Active Employess', status: 'Active' },
    { label: 'Temporarily Suspended Employees', status: 'Temporarily suspended' },
    { label: 'Inactive Employees', status: 'Inactive' },
    { label: 'Terminated Employees', status: 'Terminated' }
  ]

  columnDefs: any[] = [
    { header: 'Id', cell: { field: 'id', component: TableComponent } },
    { header: 'Name', cell: { field: 'name', component: TableComponent } },
    { header: 'Designation', cell: { field: 'designation', component: TableComponent } },
    { header: 'Location', cell: { field: 'location', component: TableComponent } },
    { header: 'Status', cell: { field: 'status', component: TableComponent } },
  ]
  
  ngOnInit(): void {
    
  }
  
  getSortedEmployeesList(status: string) {
    if (status === 'All') {
      return this.employeesList;
    } else {
      return this.employeesList.filter(employee => employee.status === status);
    }
  }
}
