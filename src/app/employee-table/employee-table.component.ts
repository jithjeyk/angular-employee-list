import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatTableModule, MatTable } from '@angular/material/table';

import { EmployeeDetails } from '../shared/models/employee.interface';

const materialModules = [
  MatTableModule,
  MatTable
];

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [...materialModules, NgFor],
  templateUrl: './employee-table.component.html',
  styleUrl: './employee-table.component.scss'
})
export class EmployeeTableComponent implements OnInit {
  @Input() employeesList: EmployeeDetails[] = [];
  @Input() columnDefs: any[] = [];

  displayedColumns: string[] = [];

  ngOnInit(): void {
    this.displayedColumns = this.columnDefs.map(colDef => colDef.cell.field);
  }
}
