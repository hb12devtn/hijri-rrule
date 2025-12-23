/**
 * Tabular Islamic Calendar Provider
 *
 * Uses the fixed Tabular Islamic Calendar algorithm (Type IIa)
 * with a 30-year cycle containing 11 leap years.
 *
 * This is the traditional calculational calendar and matches
 * the Intl `islamic-tbla` calendar type.
 */

import { CalendarProvider, IslamicCalendarType } from '../types';
import {
  HIJRI_EPOCH_JD,
  LUNAR_CYCLE_YEARS,
  LUNAR_CYCLE_DAYS,
  LEAP_YEARS_IN_CYCLE,
  COMMON_YEAR_DAYS,
  LEAP_YEAR_DAYS,
  MONTH_DAYS,
  MIN_MONTH,
  MAX_MONTH,
} from '../../constants/calendar';

/**
 * Tabular Islamic Calendar Provider
 *
 * Implements the CalendarProvider interface using the fixed
 * tabular algorithm with 30-year cycles.
 */
export class TabularCalendarProvider implements CalendarProvider {
  readonly type: IslamicCalendarType = 'islamic-tbla';

  /**
   * Check if a Hijri year is a leap year
   * Leap years in the 30-year cycle: 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
   */
  isLeapYear(year: number): boolean {
    let yearInCycle = year % LUNAR_CYCLE_YEARS;
    if (yearInCycle <= 0) {
      yearInCycle += LUNAR_CYCLE_YEARS;
    }
    return LEAP_YEARS_IN_CYCLE.includes(yearInCycle);
  }

  /**
   * Get the number of days in a Hijri month
   * Odd months have 30 days, even months have 29 days
   * Exception: Month 12 has 30 days in leap years
   */
  getMonthLength(year: number, month: number): number {
    if (month < MIN_MONTH || month > MAX_MONTH) {
      throw new Error(`Invalid Hijri month: ${month}. Must be between 1 and 12.`);
    }

    // Month 12 (Dhu al-Hijjah) has 30 days in leap years
    if (month === 12 && this.isLeapYear(year)) {
      return 30;
    }

    return MONTH_DAYS[month - 1];
  }

  /**
   * Get the total number of days in a Hijri year
   */
  getYearLength(year: number): number {
    return this.isLeapYear(year) ? LEAP_YEAR_DAYS : COMMON_YEAR_DAYS;
  }

  /**
   * Convert a Gregorian Date to Hijri date components
   */
  gregorianToHijri(date: Date): { year: number; month: number; day: number } {
    const jdn = this.gregorianToJulianDay(date);
    return this.julianDayToHijri(jdn);
  }

  /**
   * Convert Hijri date components to a Gregorian Date
   */
  hijriToGregorian(year: number, month: number, day: number): Date {
    const jdn = this.hijriToJulianDay(year, month, day);
    return this.julianDayToGregorian(jdn);
  }

  /**
   * Validate if a Hijri date exists
   */
  isValidDate(year: number, month: number, day: number): boolean {
    if (!Number.isInteger(year) || year < 1) {
      return false;
    }

    if (!Number.isInteger(month) || month < MIN_MONTH || month > MAX_MONTH) {
      return false;
    }

    if (!Number.isInteger(day) || day < 1) {
      return false;
    }

    const maxDay = this.getMonthLength(year, month);
    return day <= maxDay;
  }

  // ========== Internal conversion methods ==========

  private gregorianToJulianDay(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    return (
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045
    );
  }

  private julianDayToGregorian(jdn: number): Date {
    const z = Math.floor(jdn + 0.5);
    let a = z;

    if (z >= 2299161) {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      a = z + 1 + alpha - Math.floor(alpha / 4);
    }

    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);

    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;

    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  private hijriToJulianDay(year: number, month: number, day: number): number {
    // Complete 30-year cycles
    const cycles = Math.floor((year - 1) / LUNAR_CYCLE_YEARS);
    const yearsInCycle = ((year - 1) % LUNAR_CYCLE_YEARS) + 1;

    // Days from complete cycles
    let days = cycles * LUNAR_CYCLE_DAYS;

    // Days from years within current cycle
    for (let y = 1; y < yearsInCycle; y++) {
      days += LEAP_YEARS_IN_CYCLE.includes(y) ? LEAP_YEAR_DAYS : COMMON_YEAR_DAYS;
    }

    // Days from months in current year
    for (let m = 1; m < month; m++) {
      days += this.getMonthLength(year, m);
    }

    // Add day of month (minus 1 because epoch is day 1)
    days += day - 1;

    return HIJRI_EPOCH_JD + days;
  }

  private julianDayToHijri(jdn: number): { year: number; month: number; day: number } {
    const daysSinceEpoch = Math.floor(jdn - HIJRI_EPOCH_JD + 0.5);

    if (daysSinceEpoch < 0) {
      throw new Error('Date is before Hijri epoch (1 Muharram 1 AH)');
    }

    // Calculate 30-year cycles
    const cycles = Math.floor(daysSinceEpoch / LUNAR_CYCLE_DAYS);
    let remainingDays = daysSinceEpoch % LUNAR_CYCLE_DAYS;

    // Calculate year within cycle
    let year = cycles * LUNAR_CYCLE_YEARS;
    for (let y = 1; y <= LUNAR_CYCLE_YEARS; y++) {
      const yearLength = LEAP_YEARS_IN_CYCLE.includes(y) ? LEAP_YEAR_DAYS : COMMON_YEAR_DAYS;

      if (remainingDays < yearLength) {
        year += y;
        break;
      }
      remainingDays -= yearLength;

      if (y === LUNAR_CYCLE_YEARS) {
        year += LUNAR_CYCLE_YEARS;
        remainingDays = 0;
      }
    }

    // Calculate month and day
    let month = 1;
    for (let m = 1; m <= 12; m++) {
      const monthLength = this.getMonthLength(year, m);
      if (remainingDays < monthLength) {
        month = m;
        break;
      }
      remainingDays -= monthLength;

      if (m === 12) {
        month = 12;
      }
    }

    const day = remainingDays + 1;

    return { year, month, day };
  }
}

/**
 * Singleton instance
 */
let instance: TabularCalendarProvider | null = null;

/**
 * Get the TabularCalendarProvider singleton
 */
export function getTabularProvider(): TabularCalendarProvider {
  if (!instance) {
    instance = new TabularCalendarProvider();
  }
  return instance;
}
