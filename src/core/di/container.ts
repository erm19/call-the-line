import 'reflect-metadata';
import { container as tsyringeContainer } from 'tsyringe';

/**
 * Dependency Injection Container
 * Wrapper around tsyringe for type-safe dependency injection
 */
export class DIContainer {
  private static instance: DIContainer;

  private constructor() {}

  /**
   * Gets the singleton instance
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Registers a singleton dependency
   */
  registerSingleton<T>(
    token: string | symbol,
    implementation: new (...args: unknown[]) => T,
  ): void {
    tsyringeContainer.registerSingleton(token as never, implementation as never);
  }

  /**
   * Registers a transient dependency (new instance each time)
   */
  registerTransient<T>(
    token: string | symbol,
    implementation: new (...args: unknown[]) => T,
  ): void {
    tsyringeContainer.register(token as never, implementation as never);
  }

  /**
   * Registers an instance directly
   */
  registerInstance<T>(token: string | symbol, instance: T): void {
    tsyringeContainer.registerInstance(token as never, instance as never);
  }

  /**
   * Resolves a dependency
   */
  resolve<T>(token: string | symbol): T {
    return tsyringeContainer.resolve(token as never) as T;
  }

  /**
   * Clears all registrations (useful for testing)
   */
  clear(): void {
    tsyringeContainer.clearInstances();
  }
}

/**
 * Dependency injection tokens
 */
export const DI_TOKENS = {
  // Repositories
  SessionRepository: Symbol('SessionRepository'),
  ClipRepository: Symbol('ClipRepository'),
  CalibrationRepository: Symbol('CalibrationRepository'),
  AIReviewRepository: Symbol('AIReviewRepository'),
  NRTConfigRepository: Symbol('NRTConfigRepository'),

  // Platform Services
  CameraService: Symbol('CameraService'),
  NRTCameraService: Symbol('NRTCameraService'),
  PermissionService: Symbol('PermissionService'),
  FileStorageService: Symbol('FileStorageService'),
  MotionSensorService: Symbol('MotionSensorService'),

  // Data Sources
  SessionLocalDataSource: Symbol('SessionLocalDataSource'),
  ClipLocalDataSource: Symbol('ClipLocalDataSource'),
  CalibrationLocalDataSource: Symbol('CalibrationLocalDataSource'),
  NRTConfigLocalDataSource: Symbol('NRTConfigLocalDataSource'),
  SessionRemoteDataSource: Symbol('SessionRemoteDataSource'),
  AIReviewRemoteDataSource: Symbol('AIReviewRemoteDataSource'),

  // Analytics
  AnalyticsService: Symbol('AnalyticsService'),

  // API Client
  ApiClient: Symbol('ApiClient'),

  // Database
  DbClient: Symbol('DbClient'),
} as const;

/**
 * Export singleton instance
 */
export const diContainer = DIContainer.getInstance();
