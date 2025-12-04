import { PaginationParams, PaginationResult } from "../types/common";

export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}

export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function validatePaginationParams(params: PaginationParams): void {
  if (params.page < 1) {
    throw new Error("Page must be greater than 0");
  }
  if (params.limit < 1) {
    throw new Error("Limit must be greater than 0");
  }
  if (params.limit > 100) {
    throw new Error("Limit cannot exceed 100");
  }
}
