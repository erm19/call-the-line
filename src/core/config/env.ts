/**
 * Environment configuration
 */

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

/**
 * Current environment
 */
export const CURRENT_ENV: Environment =
  (process.env.NODE_ENV as Environment) || Environment.Development;

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  isDevelopment: CURRENT_ENV === Environment.Development,
  isStaging: CURRENT_ENV === Environment.Staging,
  isProduction: CURRENT_ENV === Environment.Production,

  /**
   * API base URL
   */
  apiBaseUrl:
    CURRENT_ENV === Environment.Production
      ? 'https://api.calltheline.app'
      : CURRENT_ENV === Environment.Staging
        ? 'https://api-staging.calltheline.app'
        : 'http://localhost:3000',

  /**
   * Enable debug logging
   */
  enableDebugLogging: CURRENT_ENV !== Environment.Production,

  /**
   * Enable NRT diagnostics overlay
   */
  enableNRTDiagnostics: CURRENT_ENV === Environment.Development,

  /**
   * API version
   */
  apiVersion: 'v1',
} as const;
