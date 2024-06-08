import { Component, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { MatButton } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTable } from '@angular/material/table';

import * as pdfjsLib from 'pdfjs-dist';

export interface EmployeeDetails {
  id: string;
  name: string;
  designation: string;
  location: string;
  status: string;
}

const materialModules = [
  MatButton,
  MatTabsModule,
  MatTableModule,
  MatTable
];



@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [...materialModules, AsyncPipe],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnInit {
  @ViewChild(MatTable) table!: MatTable<any>;
  currentFile?: File;
  progress = 0;
  message = '';
  extractedData: any[] = [];

  fileName = 'No File Choosen';

  extractedText: string = '';

  employeesList: EmployeeDetails[] = [];

  displayedColumns: string[] = ['id', 'name', 'designation', 'location', 'status'];
  // dataSource = this.employeesList;

  constructor() { }

  ngOnInit(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  async selectFile(event: any): Promise<void> {
    try {
      this.progress = 0;
      this.message = "";
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
    const file = this.currentFile;
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      try {
        reader.onload = async () => {
          const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(reader.result as ArrayBuffer) }).promise;
          const maxPages = pdf.numPages;
          let text = '';
          for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => ('str' in item ? item.str : '')).join('\n');
            text += pageText + '\n';
          }
          // this.extractedText = text;
          await this.parseEmployeeData(text);
          if (this.employeesList.length) this.table.renderRows();
          console.log('formatedEmployees', this.employeesList);
        };
      } catch (e) {
        console.log('error', e);
      }
    }
  }

  parseEmployeeData(data: string) {
    const placeholderNewYork = "New_York";
    const placeholderTempSuspended = "Temporarily_suspended";
    let replacedString = data.replace(/New York/g, placeholderNewYork);
    replacedString = replacedString.replace(/Temporarily suspended/g, placeholderTempSuspended);
    const segments = replacedString.split(/\s+/);
    const result = segments.map(word => {
      if (word === placeholderNewYork) return "New York";
      if (word === placeholderTempSuspended) return "Temporarily suspended";
      return word;
    });
    const employeeDetailsStartIndex = result.indexOf("Location") + 1;
    const employeeListStatusStartIndex = result.indexOf("Status") + 1;
    const employeeDetails = result.slice(employeeDetailsStartIndex, employeeListStatusStartIndex - 3);
    const statuses = result.slice(employeeListStatusStartIndex);
    for (let i = 0; i < employeeDetails.length; i += 4) {
      this.employeesList.push({
        id: employeeDetails[i],
        name: employeeDetails[i + 1],
        designation: employeeDetails[i + 2],
        location: employeeDetails[i + 3],
        status: statuses[i / 4]
      });
    }
    return this.employeesList;
  }

}
