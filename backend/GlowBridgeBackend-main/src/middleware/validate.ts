import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/errors";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const validationError = new ValidationError(
          "Invalid request body",
          formatZodError(result.error)
        );
        return next(validationError);
      }

      res.locals.validated = result.data;
      return next();
    } catch (error) {
      return next(new ValidationError("Request body validation failed"));
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const validationError = new ValidationError(
          "Invalid query parameters",
          formatZodError(result.error)
        );
        return next(validationError);
      }

      res.locals.validatedQuery = result.data;
      return next();
    } catch (error) {
      return next(new ValidationError("Query parameter validation failed"));
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const validationError = new ValidationError(
          "Invalid route parameters",
          formatZodError(result.error)
        );
        return next(validationError);
      }

      res.locals.validatedParams = result.data;
      return next();
    } catch (error) {
      return next(new ValidationError("Route parameter validation failed"));
    }
  };
}

function formatZodError(error: ZodError): any {
  const { fieldErrors, formErrors } = error.flatten();

  const formattedErrors: Record<string, string[]> = {};

  Object.entries(fieldErrors).forEach(([field, messages]) => {
    formattedErrors[field] = Array.isArray(messages) ? messages : [];
  });

  if (formErrors.length > 0) {
    formattedErrors._form = formErrors;
  }

  return {
    fieldErrors: formattedErrors,
    issues: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    })),
  };
}

export function validateValue<T>(schema: ZodSchema<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ValidationError(
      "Validation failed",
      formatZodError(result.error)
    );
  }

  return result.data;
}
