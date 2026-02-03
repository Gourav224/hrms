import axios, { type AxiosError } from "axios";

import type { ErrorDetail, ErrorResponse } from "@/types";

export type ApiError = {
  message: string;
  status?: number;
  errors?: ErrorDetail[] | null;
};

const isErrorResponse = (data: unknown): data is ErrorResponse => {
  if (!data || typeof data !== "object") {
    return false;
  }
  return "success" in data && "message" in data;
};

export const parseApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    if (data && isErrorResponse(data)) {
      return { message: data.message, status, errors: data.errors ?? null };
    }
    return { message: axiosError.message, status };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "Unexpected error" };
};

export const getErrorMessage = (error: unknown) => parseApiError(error).message;

export const getFieldErrors = (error: unknown) => {
  const parsed = parseApiError(error);
  const fieldErrors: Record<string, string> = {};
  if (!parsed.errors) {
    return fieldErrors;
  }
  parsed.errors.forEach((err) => {
    const path = err.loc?.filter((item) => item !== "body").join(".") ?? "";
    if (path) {
      fieldErrors[path] = err.msg;
    }
  });
  return fieldErrors;
};
