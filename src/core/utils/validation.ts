import { z } from 'zod';
import { ValidationError } from '../errors/AppError';

/**
 * Validates data against a Zod schema and returns a Result
 */
export const validate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: ValidationError } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const firstError = result.error.errors[0];
  const field = firstError.path.join('.');
  return {
    success: false,
    error: new ValidationError(`${field}: ${firstError.message}`, field),
  };
};

/**
 * Common validation patterns
 */
export const Validators = {
  /**
   * Non-empty string validator
   */
  nonEmptyString: z.string().min(1, 'Must not be empty'),

  /**
   * Positive number validator
   */
  positiveNumber: z.number().positive('Must be positive'),

  /**
   * Non-negative number validator
   */
  nonNegativeNumber: z.number().nonnegative('Must be non-negative'),

  /**
   * Timestamp validator
   */
  timestamp: z.number().int().positive('Must be a valid timestamp'),

  /**
   * ISO date string validator
   */
  isoDate: z.string().datetime('Must be a valid ISO date'),
};

