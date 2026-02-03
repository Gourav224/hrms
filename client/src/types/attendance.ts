export type AttendanceStatus = "Present" | "Absent";

export type Attendance = {
  id: number;
  employee_id: number;
  date: string;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
  created_by_id: number | null;
  updated_by_id: number | null;
};

export type AttendanceCreate = {
  date: string;
  status: AttendanceStatus;
};

export type AttendanceUpdate = {
  date?: string;
  status?: AttendanceStatus;
};

export type AttendanceSummary = {
  employee_id: number;
  employee_code: string;
  total_records: number;
  total_present: number;
  total_absent: number;
};
