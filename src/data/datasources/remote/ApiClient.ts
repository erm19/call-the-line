import { ENV_CONFIG } from '@core/config/env';
import { API_CONSTANTS } from '@core/config/constants';
import { NetworkError } from '@core/errors/AppError';

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API request options
 */
export interface ApiRequestOptions {
  method: HttpMethod;
  endpoint: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * API Client
 * Base client for making HTTP requests
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = `${ENV_CONFIG.apiBaseUrl}/api/${ENV_CONFIG.apiVersion}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Makes an API request
   */
  async request<T>(options: ApiRequestOptions): Promise<T> {
    const { method, endpoint, body, headers, timeout = API_CONSTANTS.TIMEOUT_MS } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }
        throw new NetworkError(error.message);
      }
      
      throw new NetworkError('Unknown network error');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', endpoint, headers });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'POST', endpoint, body, headers });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PUT', endpoint, body, headers });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PATCH', endpoint, body, headers });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'DELETE', endpoint, headers });
  }
}

