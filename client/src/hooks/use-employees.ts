"use client";

import { toast } from "sonner";
import type { Key } from "swr";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

import { getErrorMessage } from "@/lib/api/handlers";
import { createEmployee, deleteEmployee, updateEmployee } from "@/lib/api/mutations";
import { buildQueryString } from "@/lib/api/query";
import type {
  ApiResponse,
  Employee,
  EmployeeCreate,
  EmployeeUpdate,
  PaginationMeta,
} from "@/types";

type EmployeesQuery = {
  limit?: number;
  offset?: number;
  q?: string;
};

const revalidateEmployees = (mutate: (key?: Key | ((key: Key) => boolean)) => void) => {
  mutate((key) => typeof key === "string" && key.startsWith("/employees"));
  mutate("/stats/overview");
};

export const useEmployees = (params: EmployeesQuery = {}) => {
  const query = buildQueryString(params);
  const key = `/employees${query}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Employee[]>>(key);

  return {
    employees: data?.data ?? [],
    meta: (data?.meta ?? null) as PaginationMeta | null,
    error,
    isLoading,
    mutate,
  };
};

export const useEmployee = (employeeId?: number) => {
  const key = employeeId === undefined || employeeId === null ? null : `/employees/${employeeId}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Employee>>(key);

  return {
    employee: data?.data ?? null,
    error,
    isLoading,
    mutate,
  };
};

export const useEmployeeMutations = () => {
  const { mutate } = useSWRConfig();

  const createEmployeeMutation = useSWRMutation(
    "/employees",
    async (_key, { arg }: { arg: EmployeeCreate }) => createEmployee(arg),
    {
      onSuccess: () => {
        revalidateEmployees(mutate);
        toast.success("Employee created.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  const updateEmployeeMutation = useSWRMutation(
    "/employees/update",
    async (_key, { arg }: { arg: { employeeId: number; payload: EmployeeUpdate } }) =>
      updateEmployee(arg.employeeId, arg.payload),
    {
      onSuccess: () => {
        revalidateEmployees(mutate);
        toast.success("Employee updated.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  const deleteEmployeeMutation = useSWRMutation(
    "/employees/delete",
    async (_key, { arg }: { arg: { employeeId: number } }) => deleteEmployee(arg.employeeId),
    {
      onSuccess: () => {
        revalidateEmployees(mutate);
        toast.success("Employee deleted.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  return {
    createEmployee: createEmployeeMutation,
    updateEmployee: updateEmployeeMutation,
    deleteEmployee: deleteEmployeeMutation,
  };
};
