import { Response } from "express";
import { ErrorResponse } from "../types/common";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: any) {
    super(message, 500, originalError);
  }
}

export function handleDatabaseError(error: any): AppError {
  
  if (error.code === "23505") {
    if (error.constraint === "user_email_key") {
      return new ConflictError("Email already exists");
    }
    return new ConflictError("Resource already exists");
  }

  if (error.code === "23503") {
    return new ValidationError("Invalid reference to related resource");
  }

  if (error.code === "23502") {
    return new ValidationError(`Required field '${error.column}' is missing`);
  }

  return new DatabaseError("Database operation failed", error);
}

export function formatErrorResponse(error: AppError): ErrorResponse {
  return {
    error: error.constructor.name,
    message: error.message,
    statusCode: error.statusCode,
    ...(error.details && { details: error.details }),
  };
}

export function sendErrorResponse(
  res: Response,
  error: AppError | Error
): Response {
  if (error instanceof AppError) {
    const errorResponse = formatErrorResponse(error);
    return res.status(error.statusCode).json(errorResponse);
  }

  console.error("Unexpected error:", error);
  return res.status(500).json({
    error: "InternalServerError",
    message: "An unexpected error occurred",
    statusCode: 500,
  });
}

export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      if (error.code) {
        throw handleDatabaseError(error);
      }
      throw error;
    });
  };
}
