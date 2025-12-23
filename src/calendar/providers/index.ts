/**
 * Calendar Provider Factory
 *
 * Provides the appropriate CalendarProvider based on the requested type
 * and platform capabilities.
 */

import { CalendarProvider, IslamicCalendarType } from '../types';
import { getCalendarConfig } from '../config';
import { getTabularProvider } from './tabular-provider';
import { getIntlProvider, isIntlUmalquraSupported } from './intl-provider';

// Re-export providers
export { TabularCalendarProvider, getTabularProvider } from './tabular-provider';
export { IntlCalendarProvider, getIntlProvider, isIntlUmalquraSupported } from './intl-provider';

/**
 * Cache for Intl support check (only check once per session)
 */
let intlSupportChecked = false;
let intlSupported = false;

/**
 * Check if Intl.DateTimeFormat with islamic-umalqura is supported
 */
function checkIntlSupport(): boolean {
  if (!intlSupportChecked) {
    intlSupported = isIntlUmalquraSupported();
    intlSupportChecked = true;

    if (!intlSupported) {
      console.warn(
        '[hijri-rrule] Intl.DateTimeFormat with islamic-umalqura calendar is not supported. ' +
        'Falling back to tabular calendar (islamic-tbla).'
      );
    }
  }
  return intlSupported;
}

/**
 * Get a CalendarProvider for the specified calendar type
 *
 * @param type - Calendar type ('islamic-umalqura' or 'islamic-tbla')
 * @returns CalendarProvider instance
 *
 * @example
 * ```typescript
 * const provider = getCalendarProvider('islamic-umalqura');
 * const hijri = provider.gregorianToHijri(new Date());
 * ```
 */
export function getCalendarProvider(type?: IslamicCalendarType): CalendarProvider {
  const config = getCalendarConfig();
  const calendarType = type ?? config.defaultCalendar;

  switch (calendarType) {
    case 'islamic-tbla':
      // Always use tabular provider for islamic-tbla
      return getTabularProvider();

    case 'islamic-umalqura':
      // Check if Intl is supported and enabled
      if (config.useIntl && checkIntlSupport()) {
        return getIntlProvider();
      }
      // Fallback to tabular if Intl not available
      return getTabularProvider();

    default:
      // Unknown type - use fallback
      console.warn(`Unknown calendar type: ${calendarType}. Using fallback.`);
      return getCalendarProvider(config.fallbackCalendar);
  }
}

/**
 * Get the default CalendarProvider based on configuration
 */
export function getDefaultProvider(): CalendarProvider {
  return getCalendarProvider();
}

/**
 * Reset provider singletons (useful for testing)
 */
export function resetProviders(): void {
  intlSupportChecked = false;
  intlSupported = false;
}

/**
 * Get list of available calendar types on this platform
 */
export function getAvailableCalendarTypes(): IslamicCalendarType[] {
  const types: IslamicCalendarType[] = ['islamic-tbla']; // Always available

  if (checkIntlSupport()) {
    types.unshift('islamic-umalqura'); // Add to front as preferred
  }

  return types;
}
