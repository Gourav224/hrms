import type { AxiosRequestConfig } from "axios";

import type { ApiResponse } from "@/types";

import { api } from "./client";
import { parseApiError } from "./handlers";

export const request = async <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  try {
    const response = await api.request<ApiResponse<T>>(config);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const requestData = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await request<T>(config);
  return response.data as T;
};
