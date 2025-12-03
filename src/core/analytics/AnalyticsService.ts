import { ANALYTICS_CONSTANTS } from '../config/constants';
import { ENV_CONFIG } from '../config/env';

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

/**
 * Analytics Service Interface
 * Provides event tracking and monitoring capabilities
 */
export interface IAnalyticsService {
  /**
   * Tracks an event
   */
  trackEvent(event: AnalyticsEvent): void;

  /**
   * Tracks a screen view
   */
  trackScreen(screenName: string): void;

  /**
   * Sets user properties
   */
  setUserProperties(properties: Record<string, unknown>): void;

  /**
   * Logs an error
   */
  logError(error: Error, context?: Record<string, unknown>): void;
}

/**
 * Analytics Service Implementation
 * In production, this would integrate with analytics providers (Firebase, Amplitude, etc.)
 */
export class AnalyticsService implements IAnalyticsService {
  trackEvent(event: AnalyticsEvent): void {
    if (ENV_CONFIG.enableDebugLogging) {
      console.log('[Analytics] Event:', event.name, event.properties);
    }

    // TODO: Integrate with actual analytics provider
    // Example: analytics.track(event.name, event.properties);
  }

  trackScreen(screenName: string): void {
    if (ENV_CONFIG.enableDebugLogging) {
      console.log('[Analytics] Screen View:', screenName);
    }

    // TODO: Integrate with actual analytics provider
    // Example: analytics.screen(screenName);
  }

  setUserProperties(properties: Record<string, unknown>): void {
    if (ENV_CONFIG.enableDebugLogging) {
      console.log('[Analytics] User Properties:', properties);
    }

    // TODO: Integrate with actual analytics provider
    // Example: analytics.identify(properties);
  }

  logError(error: Error, context?: Record<string, unknown>): void {
    if (ENV_CONFIG.enableDebugLogging) {
      console.error('[Analytics] Error:', error.message, context);
    }

    this.trackEvent({
      name: ANALYTICS_CONSTANTS.EVENTS.ERROR_OCCURRED,
      properties: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...context,
      },
    });

    // TODO: Integrate with error tracking provider (Sentry, Bugsnag, etc.)
  }
}

