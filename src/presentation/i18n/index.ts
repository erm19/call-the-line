import en from './en.json';

/**
 * Simple i18n implementation
 * In production, consider using react-i18next or similar
 */
type TranslationKeys = typeof en;

let currentLocale = 'en';
const translations: Record<string, TranslationKeys> = {
  en,
};

/**
 * Gets a translation by key
 */
export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: string | Record<string, unknown> = translations[currentLocale];

  for (const k of keys) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = value[k] as string | Record<string, unknown>;
    } else {
      return key; // Return key if translation not found
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Simple parameter replacement
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
      return params[paramKey]?.toString() || '';
    });
  }

  return value;
};

/**
 * Sets the current locale
 */
export const setLocale = (locale: string): void => {
  currentLocale = locale;
};

/**
 * Gets the current locale
 */
export const getLocale = (): string => currentLocale;

export default { t, setLocale, getLocale };

