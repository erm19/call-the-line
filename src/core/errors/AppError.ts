/**
 * Base application error class
 */
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR');
  }
}

/**
 * Permission-related errors
 */
export class PermissionError extends AppError {
  constructor(
    message: string = 'Permission denied',
    public readonly permission: string,
  ) {
    super(message, 'PERMISSION_ERROR');
  }
}

/**
 * Camera-related errors
 */
export class CameraError extends AppError {
  constructor(message: string = 'Camera error occurred') {
    super(message, 'CAMERA_ERROR');
  }
}

/**
 * Storage-related errors
 */
export class StorageError extends AppError {
  constructor(message: string = 'Storage operation failed') {
    super(message, 'STORAGE_ERROR');
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public readonly field?: string,
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    public readonly resource?: string,
  ) {
    super(message, 'NOT_FOUND');
  }
}

/**
 * NRT (Near Real Time) processing errors
 */
export class NRTError extends AppError {
  constructor(
    message: string = 'NRT processing failed',
    public readonly stage?: 'capture' | 'processing' | 'inference',
  ) {
    super(message, 'NRT_ERROR');
  }
}

/**
 * AI inference errors
 */
export class AIError extends AppError {
  constructor(message: string = 'AI processing failed') {
    super(message, 'AI_ERROR');
  }
}

/**
 * Unauthorized errors
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
  }
}

