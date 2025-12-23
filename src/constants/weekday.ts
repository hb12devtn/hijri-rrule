import { WeekdayNum } from '../types/weekday';

/**
 * Re-export WeekdayNum values as constants for public API
 * Allows usage like: HijriRRule.SA, HijriRRule.SU, etc.
 */
export const SA = WeekdayNum.SA;
export const SU = WeekdayNum.SU;
export const MO = WeekdayNum.MO;
export const TU = WeekdayNum.TU;
export const WE = WeekdayNum.WE;
export const TH = WeekdayNum.TH;
export const FR = WeekdayNum.FR;

/**
 * Weekday names in English (full)
 */
export const WEEKDAY_NAMES_EN: readonly string[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

/**
 * Weekday names in English (short)
 */
export const WEEKDAY_NAMES_SHORT_EN: readonly string[] = [
  'Sat',
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
];

/**
 * Weekday names in Arabic
 */
export const WEEKDAY_NAMES_AR: readonly string[] = [
  'السَّبْت',     // Saturday
  'الأَحَد',      // Sunday
  'الإِثْنَيْن',   // Monday
  'الثُّلَاثَاء', // Tuesday
  'الأَرْبِعَاء', // Wednesday
  'الخَمِيس',     // Thursday
  'الجُمُعَة',    // Friday
];

/**
 * Default week start for Islamic calendar
 */
export const DEFAULT_WKST = WeekdayNum.SU; // Sunday as per user preference
