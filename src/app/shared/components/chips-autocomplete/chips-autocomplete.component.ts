import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild, inject, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FilterOptions } from '../../models/employee.interface';

// interface FilterOption { label: string, field: string, data: [] }

@Component({
  selector: 'app-chips-autocomplete',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './chips-autocomplete.component.html',
  styleUrl: './chips-autocomplete.component.scss'
})
export class ChipsAutocompleteComponent implements OnInit {
  @Input() filterOption: FilterOptions = {
    label: '', field: '', data: [], disabled: false
  };
  @Output() filterEventEmitter = new EventEmitter<any>();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  employeeListCtrl = new FormControl('');
  filteredEmployeeList: Observable<string[]>;
  selectedFilterOptions: string[] = [];
  filterOptions: string[] = [];

  @ViewChild('employeeFilterInput') employeeFilterInput: ElementRef<HTMLInputElement> | null = null;

  announcer = inject(LiveAnnouncer);

  constructor() {
    this.filteredEmployeeList = this.employeeListCtrl.valueChanges.pipe(
      startWith(null),
      map((list: string | null) => (list ? this._employeeFilter(list) : this.filterOptions.slice())),
    );
  }

  ngOnInit(): void {
    this.filterOptions = this.filterOption.data;
  }

  add(event: MatChipInputEvent, field: string): void {
    console.log('add-field', field);
    const value = (event.value || '').trim();
    if (value) {

      this.selectedFilterOptions.push(value);
      this.updateFilterOptions(field);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.employeeListCtrl.setValue(null);
  }

  async removeFilter(filterOption: string, field: string): Promise<void> {
    console.log('remove-field', field);
    const index = this.selectedFilterOptions.indexOf(filterOption);

    if (index >= 0) {
      this.selectedFilterOptions.splice(index, 1);
      this.updateFilterOptions(field);

      this.announcer.announce(`Removed ${filterOption}`);

      this.employeeListCtrl.setValue(null);
    }
  }

  selected(event: MatAutocompleteSelectedEvent, field: string): void {
    console.log('selected-field', field);
    this.selectedFilterOptions.push(event.option.viewValue);
    this.updateFilterOptions(field);
    if (this.employeeFilterInput)
      this.employeeFilterInput.nativeElement.value = '';
    this.employeeListCtrl.setValue(null);
  }

  private _employeeFilter(value: string): string[] {
    const filterValue = value.toLocaleLowerCase();
    return this.filterOptions.filter(list => list.toLowerCase().includes(filterValue));
  }

  updateFilterOptions(field: string): void {
    const eventData = {
      filterValues: this.selectedFilterOptions,
      field
    }
    this.filterOptions = this.filterOption.data.filter(option => !this.selectedFilterOptions.includes(option));
    this.filterEventEmitter.emit(eventData);
  }
}
