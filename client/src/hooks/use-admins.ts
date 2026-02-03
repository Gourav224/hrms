"use client";

import { toast } from "sonner";
import type { Key } from "swr";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

import { getErrorMessage } from "@/lib/api/handlers";
import { createAdmin, deleteAdmin, updateAdmin } from "@/lib/api/mutations";
import { buildQueryString } from "@/lib/api/query";
import type { AdminUser, ApiResponse, PaginationMeta } from "@/types";

type AdminsQuery = {
  limit?: number;
  offset?: number;
  q?: string;
};

const revalidateAdmins = (mutate: (key?: Key | ((key: Key) => boolean)) => void) => {
  mutate((key) => typeof key === "string" && key.startsWith("/admins"));
};

export const useAdmins = (params: AdminsQuery = {}) => {
  const query = buildQueryString(params);
  const key = `/admins${query}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AdminUser[]>>(key);

  return {
    admins: data?.data ?? [],
    meta: (data?.meta ?? null) as PaginationMeta | null,
    error,
    isLoading,
    mutate,
  };
};

export const useAdminMutations = () => {
  const { mutate } = useSWRConfig();

  const createAdminMutation = useSWRMutation(
    "/admins",
    async (
      _key,
      {
        arg,
      }: {
        arg: { name?: string | null; email: string; password: string; role: "admin" | "manager" };
      },
    ) => createAdmin(arg),
    {
      onSuccess: () => {
        revalidateAdmins(mutate);
        toast.success("Admin created.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  const updateAdminMutation = useSWRMutation(
    "/admins/update",
    async (
      _key,
      {
        arg,
      }: {
        arg: {
          adminId: number;
          payload: {
            name?: string | null;
            email?: string;
            password?: string;
            role?: "admin" | "manager";
          };
        };
      },
    ) => updateAdmin(arg.adminId, arg.payload),
    {
      onSuccess: () => {
        revalidateAdmins(mutate);
        toast.success("Admin updated.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  const deleteAdminMutation = useSWRMutation(
    "/admins/delete",
    async (_key, { arg }: { arg: { adminId: number } }) => deleteAdmin(arg.adminId),
    {
      onSuccess: () => {
        revalidateAdmins(mutate);
        toast.success("Admin deleted.");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  return {
    createAdmin: createAdminMutation,
    updateAdmin: updateAdminMutation,
    deleteAdmin: deleteAdminMutation,
  };
};
