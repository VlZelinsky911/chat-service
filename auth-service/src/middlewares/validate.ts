import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/index.js";
import { z } from "zod";

export interface ValidationError {
  field: string;
  message: string;
}

export const validate =
  (schema: z.ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return next(ApiError.validation("Validation failed", errors));
    }

    req.body = result.data;
    next();
  };
