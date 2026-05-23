import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Formats a date to a human-readable string
 */
export const formatDate = (date: Date | string, pattern: string = 'PPp'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern);
};

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Gets current timestamp in milliseconds
 */
export const getCurrentTimestamp = (): number => Date.now();

/**
 * Gets current date as ISO string
 */
export const getCurrentISOString = (): string => new Date().toISOString();
