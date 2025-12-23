/**
 * Supported Islamic calendar types
 *
 * - `islamic-umalqura`: Saudi Arabian official calendar based on Umm al-Qura (DEFAULT)
 * - `islamic-tbla`: Tabular Islamic Calendar with fixed month patterns
 */
export type IslamicCalendarType = 'islamic-umalqura' | 'islamic-tbla';

/**
 * Calendar Provider Interface
 *
 * Abstraction for different Islamic calendar calculation algorithms.
 * Implements Strategy pattern to allow switching between Intl-based
 * and Tabular calendar implementations.
 */
export interface CalendarProvider {
  /** Calendar type identifier */
  readonly type: IslamicCalendarType;

  /**
   * Get the number of days in a specific Hijri month
   * @param year - Hijri year
   * @param month - Hijri month (1-12)
   * @returns Number of days (29 or 30)
   */
  getMonthLength(year: number, month: number): number;

  /**
   * Check if a Hijri year is a leap year (355 days)
   * @param year - Hijri year
   * @returns true if leap year
   */
  isLeapYear(year: number): boolean;

  /**
   * Get the total number of days in a Hijri year
   * @param year - Hijri year
   * @returns 354 (normal) or 355 (leap)
   */
  getYearLength(year: number): number;

  /**
   * Convert a Gregorian date to Hijri date components
   * @param date - Gregorian Date object
   * @returns Hijri year, month, and day
   */
  gregorianToHijri(date: Date): { year: number; month: number; day: number };

  /**
   * Convert Hijri date components to a Gregorian Date
   * @param year - Hijri year
   * @param month - Hijri month (1-12)
   * @param day - Hijri day (1-30)
   * @returns Gregorian Date object
   */
  hijriToGregorian(year: number, month: number, day: number): Date;

  /**
   * Validate if a Hijri date is valid
   * @param year - Hijri year
   * @param month - Hijri month (1-12)
   * @param day - Hijri day
   * @returns true if valid date
   */
  isValidDate(year: number, month: number, day: number): boolean;
}

/**
 * Simple Hijri date components
 */
export interface HijriDateComponents {
  year: number;
  month: number;
  day: number;
}
