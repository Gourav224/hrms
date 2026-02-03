import type {
  Attendance,
  AttendanceCreate,
  AttendanceUpdate,
  AuthToken,
  Employee,
  EmployeeCreate,
  EmployeeUpdate,
  OverviewStats,
  SessionData,
} from "@/types";

import { requestData } from "./request";

export const loginRequest = async (email: string, password: string) => {
  return requestData<AuthToken>({
    url: "/auth/login",
    method: "POST",
    data: { email, password },
  });
};

export const refreshSession = async () =>
  requestData<SessionData>({
    url: "/auth/session",
    method: "GET",
  });

export const createEmployee = async (payload: EmployeeCreate) =>
  requestData<Employee>({
    url: "/employees",
    method: "POST",
    data: payload,
  });

export const updateEmployee = async (employeeId: string, payload: EmployeeUpdate) =>
  requestData<Employee>({
    url: `/employees/${employeeId}`,
    method: "PATCH",
    data: payload,
  });

export const deleteEmployee = async (employeeId: string) =>
  requestData<{ status: string }>({
    url: `/employees/${employeeId}`,
    method: "DELETE",
  });

export const createAttendance = async (employeeId: string, payload: AttendanceCreate) =>
  requestData<Attendance>({
    url: `/employees/${employeeId}/attendance`,
    method: "POST",
    data: payload,
  });

export const updateAttendance = async (
  employeeId: string,
  attendanceId: number,
  payload: AttendanceUpdate,
) =>
  requestData<Attendance>({
    url: `/employees/${employeeId}/attendance/${attendanceId}`,
    method: "PATCH",
    data: payload,
  });

export const deleteAttendance = async (employeeId: string, attendanceId: number) =>
  requestData<{ status: string }>({
    url: `/employees/${employeeId}/attendance/${attendanceId}`,
    method: "DELETE",
  });

export const upsertTodayAttendance = async (employeeId: string, status: "Present" | "Absent") =>
  requestData<Attendance>({
    url: `/employees/${employeeId}/attendance/today`,
    method: "PUT",
    data: { status },
  });

export const getOverviewStats = async () =>
  requestData<OverviewStats>({
    url: "/stats/overview",
    method: "GET",
  });
