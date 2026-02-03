"use client";

import useSWR from "swr";

import type { ApiResponse, OverviewStats } from "@/types";

export const useOverviewStats = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<OverviewStats>>("/stats/overview");

  return {
    stats: data?.data ?? null,
    meta: data?.meta ?? null,
    error,
    isLoading,
    mutate,
  };
};
