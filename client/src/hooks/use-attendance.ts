"use client";

import { toast } from "sonner";
import type { Key } from "swr";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

import { getErrorMessage } from "@/lib/api/handlers";
import { createAttendance, deleteAttendance, updateAttendance } from "@/lib/api/mutations";
import { buildQueryString } from "@/lib/api/query";
import type {
  ApiResponse,
  Attendance,
  AttendanceCreate,
  AttendanceStatsMeta,
  AttendanceStatsPoint,
  AttendanceSummary,
  AttendanceUpdate,
  PaginationMeta,
} from "@/types";

type AttendanceQuery = {
  limit?: number;
  offset?: number;
  date_from?: string;
  date_to?: string;
};

const revalidateAttendance = (
  mutate: (key?: Key | ((key: Key) => boolean)) => void,
  employeeId: number,
) => {
  mutate((key) => typeof key === "string" && key.startsWith(`/employees/${employeeId}`));
};

export const useAttendance = (employeeId?: number, params: AttendanceQuery = {}) => {
  const query = buildQueryString(params);
  const key =
    employeeId === undefined || employeeId === null
      ? null
      : `/employees/${employeeId}/attendance${query}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Attendance[]>>(key);

  return {
    records: data?.data ?? [],
    meta: (data?.meta ?? null) as PaginationMeta | null,
    error,
    isLoading,
    mutate,
  };
};

export const useAttendanceSummary = (
  employeeId?: number,
  params: { date_from?: string; date_to?: string } = {},
) => {
  const query = buildQueryString(params);
  const key =
    employeeId === undefined || employeeId === null
      ? null
      : `/employees/${employeeId}/attendance/summary${query}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AttendanceSummary>>(key);

  return {
    summary: data?.data ?? null,
    error,
    isLoading,
    mutate,
  };
};

export const useAttendanceStats = (
  params: { date_from?: string; date_to?: string; employee_id?: number } = {},
) => {
  const query = buildQueryString(params);
  const key = `/attendance/stats${query}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AttendanceStatsPoint[]>>(key);

  return {
    points: data?.data ?? [],
    meta: (data?.meta ?? null) as AttendanceStatsMeta | null,
    error,
    isLoading,
    mutate,
  };
};

export const useAttendanceMutations = (employeeId: number) => {
  const { mutate } = useSWRConfig();

  const createAttendanceMutation = useSWRMutation(
    `/employees/${employeeId}/attendance`,
    async (_key: string, { arg }: { arg: AttendanceCreate }) => createAttendance(employeeId, arg),
    {
      onSuccess: () => {
        revalidateAttendance(mutate, employeeId);
        toast.success("Attendance saved.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  const updateAttendanceMutation = useSWRMutation(
    `/employees/${employeeId}/attendance/update`,
    async (_key: string, { arg }: { arg: { attendanceId: number; payload: AttendanceUpdate } }) =>
      updateAttendance(employeeId, arg.attendanceId, arg.payload),
    {
      onSuccess: () => {
        revalidateAttendance(mutate, employeeId);
        toast.success("Attendance updated.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  const deleteAttendanceMutation = useSWRMutation(
    `/employees/${employeeId}/attendance/delete`,
    async (_key: string, { arg }: { arg: { attendanceId: number } }) =>
      deleteAttendance(employeeId, arg.attendanceId),
    {
      onSuccess: () => {
        revalidateAttendance(mutate, employeeId);
        toast.success("Attendance deleted.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  return {
    createAttendance: createAttendanceMutation,
    updateAttendance: updateAttendanceMutation,
    deleteAttendance: deleteAttendanceMutation,
  };
};
