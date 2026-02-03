export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  meta?: Record<string, unknown> | null;
};

export type ErrorDetail = {
  loc?: Array<string | number>;
  msg: string;
  type?: string;
};

export type ErrorResponse = {
  success: false;
  message: string;
  errors?: ErrorDetail[] | null;
};

export type PaginationMeta = {
  total: number;
  limit: number;
  offset: number;
  q?: string;
};
