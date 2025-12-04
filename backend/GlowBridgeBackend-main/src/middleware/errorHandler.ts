import { Request, Response, NextFunction } from "express";
import { AppError, sendErrorResponse } from "../utils/errors";

export function globalErrorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  
  if (res.headersSent) {
    return next(error);
  }

  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  return sendErrorResponse(res, error);
}

export function notFoundHandler(req: Request, res: Response): Response {
  return res.status(404).json({
    error: "NotFoundError",
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
}

export function asyncWrapper<T extends any[], R>(
  fn: (req: Request, res: Response, ...args: T) => Promise<R>
) {
  return (req: Request, res: Response, next: NextFunction, ...args: T) => {
    Promise.resolve(fn(req, res, ...args)).catch(next);
  };
}
