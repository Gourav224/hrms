import type {
  AdminUser,
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

import { buildQueryString } from "./query";
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

export const updateEmployee = async (employeeId: number, payload: EmployeeUpdate) =>
  requestData<Employee>({
    url: `/employees/${employeeId}`,
    method: "PATCH",
    data: payload,
  });

export const deleteEmployee = async (employeeId: number) =>
  requestData<{ status: string }>({
    url: `/employees/${employeeId}`,
    method: "DELETE",
  });

export const createAttendance = async (employeeId: number, payload: AttendanceCreate) =>
  requestData<Attendance>({
    url: `/employees/${employeeId}/attendance`,
    method: "POST",
    data: payload,
  });

export const updateAttendance = async (
  employeeId: number,
  attendanceId: number,
  payload: AttendanceUpdate,
) =>
  requestData<Attendance>({
    url: `/employees/${employeeId}/attendance/${attendanceId}`,
    method: "PATCH",
    data: payload,
  });

export const deleteAttendance = async (employeeId: number, attendanceId: number) =>
  requestData<{ status: string }>({
    url: `/employees/${employeeId}/attendance/${attendanceId}`,
    method: "DELETE",
  });

export const upsertTodayAttendance = async (employeeId: number, status: "Present" | "Absent") =>
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

export const listAdmins = async (params: { limit?: number; offset?: number; q?: string } = {}) =>
  requestData<AdminUser[]>({
    url: `/admins${buildQueryString(params)}`,
    method: "GET",
  });

export const createAdmin = async (payload: {
  name?: string | null;
  email: string;
  password: string;
  role: "admin" | "manager";
}) =>
  requestData<AdminUser>({
    url: "/admins",
    method: "POST",
    data: payload,
  });

export const updateAdmin = async (
  adminId: number,
  payload: {
    name?: string | null;
    email?: string;
    password?: string;
    role?: "admin" | "manager";
  },
) =>
  requestData<AdminUser>({
    url: `/admins/${adminId}`,
    method: "PATCH",
    data: payload,
  });

export const deleteAdmin = async (adminId: number) =>
  requestData<{ status: string }>({
    url: `/admins/${adminId}`,
    method: "DELETE",
  });
