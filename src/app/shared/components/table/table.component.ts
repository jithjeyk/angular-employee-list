import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatTableModule, MatTable } from '@angular/material/table';

import { EmployeeDetails } from '../../../shared/models/employee.interface';

const materialModules = [
  MatTableModule,
  MatTable
];

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [...materialModules, NgFor],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  @Input() employeesList: EmployeeDetails[] = [];
  @Input() columnDefs: any[] = [];

  displayedColumns: string[] = [];

  ngOnInit(): void {
    this.displayedColumns = this.columnDefs.map(colDef => colDef.cell.field);
  }
}
