import { IslamicCalendarType } from './types';

/**
 * Global calendar configuration
 */
export interface CalendarConfig {
  /**
   * Default calendar type for new HijriRRule instances
   * @default 'islamic-umalqura'
   */
  defaultCalendar: IslamicCalendarType;

  /**
   * Whether to use Intl.DateTimeFormat for calendar calculations
   * Set to false to always use the tabular algorithm
   * @default true
   */
  useIntl: boolean;

  /**
   * Fallback calendar when Intl is unavailable or fails
   * @default 'islamic-tbla'
   */
  fallbackCalendar: IslamicCalendarType;

  /**
   * Cache configuration
   */
  cache: {
    /** Enable caching for calendar calculations */
    enabled: boolean;
    /** Maximum cache entries */
    maxSize: number;
  };
}

/**
 * Default configuration
 */
const defaultConfig: CalendarConfig = {
  defaultCalendar: 'islamic-umalqura',
  useIntl: true,
  fallbackCalendar: 'islamic-tbla',
  cache: {
    enabled: true,
    maxSize: 1000,
  },
};

/**
 * Current global configuration (mutable)
 */
let globalConfig: CalendarConfig = { ...defaultConfig };

/**
 * Get the current calendar configuration
 * @returns Copy of the current configuration
 */
export function getCalendarConfig(): CalendarConfig {
  return {
    ...globalConfig,
    cache: { ...globalConfig.cache },
  };
}

/**
 * Set global calendar configuration
 *
 * @param config - Partial configuration to merge
 *
 * @example
 * ```typescript
 * // Use tabular calendar as default
 * setCalendarConfig({ defaultCalendar: 'islamic-tbla' });
 *
 * // Disable Intl (always use tabular)
 * setCalendarConfig({ useIntl: false });
 * ```
 */
export function setCalendarConfig(config: Partial<CalendarConfig>): void {
  globalConfig = {
    ...globalConfig,
    ...config,
    cache: {
      ...globalConfig.cache,
      ...(config.cache ?? {}),
    },
  };
}

/**
 * Reset configuration to defaults
 */
export function resetCalendarConfig(): void {
  globalConfig = { ...defaultConfig };
}
