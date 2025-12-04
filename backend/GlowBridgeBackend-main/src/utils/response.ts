import { Response } from "express";
import { ApiResponse } from "../types/common";

export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };

  return res.status(statusCode).json(response);
}

export function sendCreatedResponse<T>(
  res: Response,
  data: T,
  message: string = "Resource created successfully"
): Response {
  return sendSuccessResponse(res, data, 201, message);
}

export function sendDeletedResponse(
  res: Response,
  message: string = "Resource deleted successfully"
): Response {
  const response: ApiResponse = {
    success: true,
    message,
  };

  return res.status(200).json(response);
}

export function sendLegacyResponse<T>(
  res: Response,
  data: T,
  dataKey: string,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({ [dataKey]: data });
}

export function success<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

export function error(message: string, statusCode: number = 400): ApiResponse {
  return {
    success: false,
    error: message,
  };
}
