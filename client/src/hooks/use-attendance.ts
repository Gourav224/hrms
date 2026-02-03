"use client";

import type { Key } from "swr";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

import { createAttendance, deleteAttendance, updateAttendance } from "@/lib/api/mutations";
import { buildQueryString } from "@/lib/api/query";
import type {
  ApiResponse,
  Attendance,
  AttendanceCreate,
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
  employeeId: string,
) => {
  mutate((key) => typeof key === "string" && key.startsWith(`/employees/${employeeId}`));
};

export const useAttendance = (employeeId: string, params: AttendanceQuery = {}) => {
  const query = buildQueryString(params);
  const key = `/employees/${employeeId}/attendance${query}`;
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
  employeeId: string,
  params: { date_from?: string; date_to?: string } = {},
) => {
  const query = buildQueryString(params);
  const key = `/employees/${employeeId}/attendance/summary${query}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AttendanceSummary>>(key);

  return {
    summary: data?.data ?? null,
    error,
    isLoading,
    mutate,
  };
};

export const useAttendanceMutations = (employeeId: string) => {
  const { mutate } = useSWRConfig();

  const createAttendanceMutation = useSWRMutation(
    `/employees/${employeeId}/attendance`,
    async (_key, { arg }: { arg: AttendanceCreate }) => createAttendance(employeeId, arg),
    {
      onSuccess: () => revalidateAttendance(mutate, employeeId),
    },
  );

  const updateAttendanceMutation = useSWRMutation(
    `/employees/${employeeId}/attendance/update`,
    async (_key, { arg }: { arg: { attendanceId: number; payload: AttendanceUpdate } }) =>
      updateAttendance(employeeId, arg.attendanceId, arg.payload),
    {
      onSuccess: () => revalidateAttendance(mutate, employeeId),
    },
  );

  const deleteAttendanceMutation = useSWRMutation(
    `/employees/${employeeId}/attendance/delete`,
    async (_key, { arg }: { arg: { attendanceId: number } }) =>
      deleteAttendance(employeeId, arg.attendanceId),
    {
      onSuccess: () => revalidateAttendance(mutate, employeeId),
    },
  );

  return {
    createAttendance: createAttendanceMutation,
    updateAttendance: updateAttendanceMutation,
    deleteAttendance: deleteAttendanceMutation,
  };
};
