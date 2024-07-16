import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { TabsComponent } from '../../shared/components/tabs/tabs.component';
import { EmployeeDetails, Filter, FilterOptions, FilterField } from '../../shared/models/employee.interface';
import { ChipsAutocompleteComponent } from '../../shared/components/chips-autocomplete/chips-autocomplete.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [FileUploadComponent, TabsComponent, ChipsAutocompleteComponent, NgFor],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent {
  employeesList: EmployeeDetails[] = [];
  employeeTableData: EmployeeDetails[] = [];
  filterOptions: FilterOptions[] = [
    { label: 'Employee Id', field: 'id', data: [], disabled: false },
    { label: 'Designation', field: 'designation', data: [], disabled: false },
    { label: 'Location', field: 'location', data: [], disabled: false }
  ];
  filter: Filter = {
    id: [],
    designation: [],
    location: []
  };

  async onUploadReceived(data: any) {
    const { file, pdfjsLib } = data;
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
          await this.parseEmployeeData(text);
          console.log('formatedEmployees', this.employeesList);
          console.time("before loop");
          this.getEmployeeFilterOptions(this.employeesList);
          console.timeEnd("after loop");
          console.log('getEmployeeFilterOptions', this.filterOptions);
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
    this.employeesList = [];
    for (let i = 0; i < employeeDetails.length; i += 4) {
      this.employeesList.push({
        id: employeeDetails[i],
        name: employeeDetails[i + 1],
        designation: employeeDetails[i + 2],
        location: employeeDetails[i + 3],
        status: statuses[i / 4]
      });
    }
    this.employeeTableData = this.employeesList
    return this.employeesList;
  }

  getEmployeeFilterOptions(employeesList: EmployeeDetails[]) {
    try {
      // Initialize new filter options with empty data arrays
      const newFilterOptions = this.filterOptions.map(option => ({ ...option, data: [] }));
      const filterOptionsMap = new Map<string, string[]>(newFilterOptions.map(option => [option.field, option.data]));
      console.log('filterOptionsMap', filterOptionsMap);

      // Populate the filter options map with employee data
      employeesList.forEach(employee => {
        for (const field in employee) {
          if (filterOptionsMap.has(field)) {
            filterOptionsMap.get(field)?.push(employee[field as keyof EmployeeDetails]);
          }
        }
      });

      // Convert the map back to filterOptions structure
      this.filterOptions = newFilterOptions.map(option => ({
        label: option.label,
        field: option.field,
        data: filterOptionsMap.get(option.field) || [],
        disabled: false
      }));

      return this.filterOptions;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }

  onFilterChange(event: { field: FilterField, filterValues: string[] }) {
    console.log('filterValue', event);
    this.updateFilterCriteria(event);
    this.employeeTableData = event?.filterValues.length ? this.getFilteredDetails(event) : this.employeesList;
    console.log('--employeeTableData', this.employeeTableData);
    // Update filter options disabled state
    this.updateFilterOptions(event.field);
  }
  getFilteredDetails(event: { field: FilterField, filterValues: string[] }): EmployeeDetails[] {
    // const filter = {
    //   id: [],
    //   designation: [],
    //   location: []
    // }
    // switch (event.field) {
    //   case 'id':
    //     console.log('id', event.field);
    //     // filter.id = event?.filterValues
    //     return this.employeesList.filter(item => event?.filterValues.includes(item.id));
    //   case 'designation':
    //     console.log('designation', event.field);
    //     // filter.designation = event?.filterValues
    //     return this.employeesList.filter(item => event?.filterValues.includes(item.designation));
    //   case 'location':
    //     console.log('location', event.field);
    //     // filter.location = event?.filterValues
    //     return this.employeesList.filter(item => event?.filterValues.includes(item.location));
    //   default:
    //     console.log('Unknown filter field:', event.field);
    //     return [];
    // }
    // const filterField = event.field;
    // const filterValues = event?.filterValues || [];

    // return this.employeesList.filter(item => filterValues.includes(item[filterField]));

    return this.employeesList.filter(item => {
      const matchesId = !this.filter.id.length || this.filter.id.includes(item.id);
      const matchesDesignation = !this.filter.designation.length || this.filter.designation.includes(item.designation);
      const matchesLocation = !this.filter.location.length || this.filter.location.includes(item.location);
      switch (event.field) {
        case 'id':
          return matchesId
        default:
          return matchesDesignation && matchesLocation;
      }
    });
  }
  updateFilterCriteria(event: { field: FilterField, filterValues: string[] }) {
    this.filter[event.field] = event?.filterValues || [];
  }
  updateFilterOptions(field: string) {
    if (field === 'id') {
      this.filterOptions.forEach(option => {
        option.disabled = option.field !== 'id';
      });
    } else {
      this.filterOptions.forEach(option => {
        option.disabled = option.field === 'id';
      });
    }
  }
}
