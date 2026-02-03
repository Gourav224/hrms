"use client";

import type { Key } from "swr";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

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

export const useEmployeeMutations = () => {
  const { mutate } = useSWRConfig();

  const createEmployeeMutation = useSWRMutation(
    "/employees",
    async (_key, { arg }: { arg: EmployeeCreate }) => createEmployee(arg),
    {
      onSuccess: () => revalidateEmployees(mutate),
    },
  );

  const updateEmployeeMutation = useSWRMutation(
    "/employees/update",
    async (_key, { arg }: { arg: { employeeId: string; payload: EmployeeUpdate } }) =>
      updateEmployee(arg.employeeId, arg.payload),
    {
      onSuccess: () => revalidateEmployees(mutate),
    },
  );

  const deleteEmployeeMutation = useSWRMutation(
    "/employees/delete",
    async (_key, { arg }: { arg: { employeeId: string } }) => deleteEmployee(arg.employeeId),
    {
      onSuccess: () => revalidateEmployees(mutate),
    },
  );

  return {
    createEmployee: createEmployeeMutation,
    updateEmployee: updateEmployeeMutation,
    deleteEmployee: deleteEmployeeMutation,
  };
};
