export type Employee = {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at: string;
  updated_at: string;
  created_by_id: number | null;
  updated_by_id: number | null;
};

export type EmployeeCreate = {
  full_name: string;
  email: string;
  department: string;
};

export type EmployeeUpdate = {
  full_name?: string;
  email?: string;
  department?: string;
};
