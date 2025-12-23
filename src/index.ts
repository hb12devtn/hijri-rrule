/**
 * Hijri RRULE Library
 *
 * A JavaScript/TypeScript library for working with recurrence rules (RRULE)
 * for the Hijri (Islamic) calendar, compatible with RFC 5545.
 *
 * @example
 * ```typescript
 * import { HijriRRule, HijriDate } from 'hijri-rrule';
 *
 * // Create a rule for 1st of Ramadan every year
 * const rule = new HijriRRule({
 *   freq: HijriRRule.YEARLY,
 *   bymonth: HijriRRule.RAMADAN,  // Use named constant instead of 9
 *   bymonthday: 1,
 *   dtstart: new HijriDate(1446, 9, 1),
 *   count: 5
 * });
 *
 * // Get all occurrences
 * const dates = rule.all();
 *
 * // Get string representation
 * console.log(rule.toString());
 * // DTSTART;CALENDAR=HIJRI:14460901
 * // RRULE:FREQ=YEARLY;BYMONTH=9;BYMONTHDAY=1;COUNT=5
 * ```
 */

// Main classes
export { HijriRRule, HijriWeekday } from './rrule/hijri-rrule';
export type { IteratorCallback } from './rrule/hijri-rrule';
export { HijriRRuleSet } from './rrule/hijri-rruleset';
export { hijriRuleStr } from './rrule/hijri-rulestr';

// Calendar
export { HijriDate, hijriDate } from './calendar/hijri-date';
export {
  isLeapYear,
  getMonthLength,
  getYearLength,
  getDaysBeforeMonth,
  isValidHijriDate,
} from './calendar/hijri-calendar';
export {
  gregorianToHijri,
  hijriToGregorian,
  gregorianToJulianDay,
  julianDayToGregorian,
} from './calendar/hijri-converter';
export {
  addDays,
  addMonths,
  addYears,
  diffDays,
  dayOfWeek,
  nthWeekdayOfMonth,
} from './calendar/hijri-date-math';

// Calendar configuration
export type { IslamicCalendarType, CalendarProvider } from './calendar/types';
export { setCalendarConfig, getCalendarConfig } from './calendar/config';
export type { CalendarConfig } from './calendar/config';
export { getCalendarProvider } from './calendar/providers';

// Types
export { Frequency } from './types/frequency';
export { WeekdayNum } from './types/weekday';
export type { WeekdaySpec } from './types/weekday';
export { Skip } from './types/options';
export type {
  PartialOptions,
  ParsedOptions,
  RRuleStrOptions,
} from './types/options';

// Constants
export {
  YEARLY,
  MONTHLY,
  WEEKLY,
  DAILY,
  HOURLY,
  MINUTELY,
  SECONDLY,
} from './constants/frequency';

export { SA, SU, MO, TU, WE, TH, FR, DEFAULT_WKST } from './constants/weekday';

export {
  HijriMonth,
  MONTH_NAMES_EN,
  MONTH_NAMES_AR,
  // Month constants
  MUHARRAM,
  SAFAR,
  RABI_AL_AWWAL,
  RABI_AL_THANI,
  JUMADA_AL_AWWAL,
  JUMADA_AL_THANI,
  RAJAB,
  SHABAN,
  RAMADAN,
  SHAWWAL,
  DHU_AL_QADAH,
  DHU_AL_HIJJAH,
} from './constants/months';

// NLP
export { toText } from './nlp/to-text';
export { getI18n, EN, AR } from './nlp/i18n';

// Parsing utilities
export { parseString, tryParseString } from './core/string-parser';
export { optionsToString } from './core/string-serializer';
