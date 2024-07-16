export interface EmployeeDetails {
  id: string;
  name: string;
  designation: string;
  location: string;
  status: string;
}

export interface Filter {
  id: string[];
  designation: string[];
  location: string[];
}

export interface FilterOptions {
  label: string;
  field: string;
  data: string[];
  disabled: boolean;
}

export type FilterField = 'id' | 'designation' | 'location';