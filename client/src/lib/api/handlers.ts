import axios, { type AxiosError } from "axios";

import type { ErrorDetail, ErrorResponse } from "@/types";

export type ApiError = {
  message: string;
  status?: number;
  errors?: ErrorDetail[] | null;
};

const isApiError = (error: unknown): error is ApiError => {
  if (!error || typeof error !== "object") {
    return false;
  }
  return "message" in error && typeof (error as { message?: unknown }).message === "string";
};

const isErrorResponse = (data: unknown): data is ErrorResponse => {
  if (!data || typeof data !== "object") {
    return false;
  }
  return "success" in data && "message" in data;
};

export const parseApiError = (error: unknown): ApiError => {
  // request.ts throws `ApiError` objects; keep them stable so UI can display them.
  if (isApiError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data as unknown;
    if (data && isErrorResponse(data)) {
      return { message: data.message, status, errors: data.errors ?? null };
    }

    // Fallback for raw FastAPI-style errors (e.g. {"detail": "..."} or {"detail":[...]})
    if (data && typeof data === "object" && "detail" in data) {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === "string") {
        return { message: detail, status };
      }
      if (Array.isArray(detail)) {
        return {
          message: "Validation error.",
          status,
          errors: detail as ErrorDetail[],
        };
      }
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
