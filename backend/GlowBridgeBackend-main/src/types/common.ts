

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface BaseEntity {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface QueryParams {
  text: string;
  values: any[];
}

export interface DatabaseResult<T> {
  rows: T[];
  rowCount: number;
}
