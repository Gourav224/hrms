import type { ApiResponse } from "@/types";

import { api } from "./client";
import { parseApiError } from "./handlers";

export const fetcher = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response = await api.get<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};
