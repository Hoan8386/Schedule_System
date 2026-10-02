// =========================================================
// Validation Middleware - Zod validation wrapper
// =========================================================

import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '@/lib/errors';

/**
 * Validate dữ liệu với Zod schema
 * Throw BadRequestError nếu không hợp lệ
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.') || 'body';
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });

      throw new BadRequestError('Dữ liệu không hợp lệ', formattedErrors);
    }
    throw error;
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>, searchParams: URLSearchParams): T {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return validate(schema, params);
}

/**
 * Validate partial data (cho PATCH requests)
 */
export function validatePartial<T>(schema: ZodSchema<T>, data: unknown): Partial<T> {
  // Zod partial schema đã được định nghĩa trong validator
  return validate(schema, data);
}
