/**
 * Result type for explicit error handling
 * Represents either a success with a value or a failure with an error
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Success result containing a value
 */
export class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(public readonly value: T) {}
}

/**
 * Failure result containing an error
 */
export class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(public readonly error: E) {}
}

/**
 * Creates a successful result
 */
export const success = <T>(value: T): Success<T> => new Success(value);

/**
 * Creates a failure result
 */
export const failure = <E>(error: E): Failure<E> => new Failure(error);

/**
 * Type guard to check if result is a success
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => {
  return result.isSuccess;
};

/**
 * Type guard to check if result is a failure
 */
export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> => {
  return result.isFailure;
};
