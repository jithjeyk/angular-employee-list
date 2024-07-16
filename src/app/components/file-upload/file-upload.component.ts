import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { EmployeeTableComponent } from '../../employee-table/employee-table.component';
import { EmployeeDetails } from '../../shared/models/employee.interface';


import * as pdfjsLib from 'pdfjs-dist';


const materialModules = [
  MatButton
];

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [...materialModules, EmployeeTableComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnInit {
  @Output() uploadEventEmitter = new EventEmitter<any>();
  currentFile?: File;
  extractedData: any[] = [];

  fileName = 'No File Choosen';

  extractedText: string = '';

  employeesList: EmployeeDetails[] = [];



  constructor() { }

  ngOnInit(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  async selectFile(event: any): Promise<void> {
    try {
      const targetFile = event.target.files[0];
      if (targetFile && targetFile.type == "application/pdf") {
        const tFile: File = targetFile;
        this.currentFile = tFile;
        this.fileName = this.currentFile.name;
      }
    }
    catch (error) {
      console.error('Error initializing PDF.js:', error);
    }
  }

  async upload(): Promise<void> {
    if (this.currentFile) {
      const data = {
        file: this.currentFile,
        pdfjsLib
      }
      this.uploadEventEmitter.emit(data);
    }
  }
}
