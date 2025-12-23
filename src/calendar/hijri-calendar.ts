import {
  LEAP_YEARS_IN_CYCLE,
  LUNAR_CYCLE_YEARS,
  DAYS_BEFORE_MONTH,
  COMMON_YEAR_DAYS,
  LEAP_YEAR_DAYS,
  MIN_MONTH,
  MAX_MONTH,
  MIN_MONTH_DAY,
} from '../constants/calendar';
import { IslamicCalendarType } from './types';
import { getCalendarProvider } from './providers';

/**
 * Check if a Hijri year is a leap year
 *
 * @param year - The Hijri year to check
 * @param calendar - Calendar type to use (defaults to global config)
 * @returns true if the year is a leap year
 *
 * Leap years in the 30-year cycle: 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
 * In a leap year, Dhu al-Hijjah (month 12) has 30 days instead of 29
 */
export function isLeapYear(year: number, calendar?: IslamicCalendarType): boolean {
  const provider = getCalendarProvider(calendar);
  return provider.isLeapYear(year);
}

/**
 * Get the number of days in a specific Hijri month
 *
 * @param year - The Hijri year
 * @param month - The Hijri month (1-12)
 * @param calendar - Calendar type to use (defaults to global config)
 * @returns Number of days in the month (29 or 30)
 *
 * Odd months (1,3,5,7,9,11) have 30 days
 * Even months (2,4,6,8,10,12) have 29 days
 * Exception: Month 12 (Dhu al-Hijjah) has 30 days in leap years
 */
export function getMonthLength(year: number, month: number, calendar?: IslamicCalendarType): number {
  const provider = getCalendarProvider(calendar);
  return provider.getMonthLength(year, month);
}

/**
 * Get the total number of days in a Hijri year
 *
 * @param year - The Hijri year
 * @param calendar - Calendar type to use (defaults to global config)
 * @returns Number of days in the year (354 or 355)
 */
export function getYearLength(year: number, calendar?: IslamicCalendarType): number {
  const provider = getCalendarProvider(calendar);
  return provider.getYearLength(year);
}

/**
 * Get the number of days before a specific month in a year
 *
 * @param _year - The Hijri year
 * @param month - The Hijri month (1-12)
 * @returns Number of days before the first day of the month
 */
export function getDaysBeforeMonth(_year: number, month: number): number {
  if (month < MIN_MONTH || month > MAX_MONTH) {
    throw new Error(`Invalid Hijri month: ${month}. Must be between 1 and 12.`);
  }

  const days = DAYS_BEFORE_MONTH[month - 1];

  // In leap years, if month > 12, we'd add 1 day
  // But since month is max 12, only month 12 itself could be affected
  // and getDaysBeforeMonth(year, 12) doesn't include month 12's days
  // So no adjustment needed here

  return days;
}

/**
 * Get the day of year for a given Hijri date
 *
 * @param year - The Hijri year
 * @param month - The Hijri month (1-12)
 * @param day - The day of month (1-30)
 * @returns Day of year (1-355)
 */
export function getDayOfYear(year: number, month: number, day: number): number {
  return getDaysBeforeMonth(year, month) + day;
}

/**
 * Convert day of year to month and day
 *
 * @param year - The Hijri year
 * @param dayOfYear - The day of year (1-355)
 * @returns Object with month and day
 */
export function dayOfYearToMonthDay(
  year: number,
  dayOfYear: number
): { month: number; day: number } {
  const yearLength = getYearLength(year);

  if (dayOfYear < 1 || dayOfYear > yearLength) {
    throw new Error(
      `Invalid day of year: ${dayOfYear}. Must be between 1 and ${yearLength}.`
    );
  }

  let remainingDays = dayOfYear;

  for (let month = 1; month <= 12; month++) {
    const monthLength = getMonthLength(year, month);
    if (remainingDays <= monthLength) {
      return { month, day: remainingDays };
    }
    remainingDays -= monthLength;
  }

  // Should never reach here
  return { month: 12, day: remainingDays };
}

/**
 * Validate if a Hijri date is valid
 *
 * @param year - The Hijri year
 * @param month - The Hijri month (1-12)
 * @param day - The day of month (1-30)
 * @returns true if the date is valid
 */
export function isValidHijriDate(
  year: number,
  month: number,
  day: number
): boolean {
  if (!Number.isInteger(year) || year < 1) {
    return false;
  }

  if (!Number.isInteger(month) || month < MIN_MONTH || month > MAX_MONTH) {
    return false;
  }

  if (!Number.isInteger(day) || day < MIN_MONTH_DAY) {
    return false;
  }

  const maxDay = getMonthLength(year, month);
  return day <= maxDay;
}

/**
 * Get the number of days from the start of year 1 to the start of the given year
 *
 * @param year - The Hijri year
 * @returns Number of days
 */
export function getDaysBeforeYear(year: number): number {
  if (year < 1) {
    throw new Error(`Invalid Hijri year: ${year}. Must be >= 1.`);
  }

  const y = year - 1;

  // Number of complete 30-year cycles
  const cycles = Math.floor(y / LUNAR_CYCLE_YEARS);

  // Years within the current cycle
  const yearsInCycle = y % LUNAR_CYCLE_YEARS;

  // Days from complete cycles
  let days = cycles * 10631; // LUNAR_CYCLE_DAYS

  // Days from years within current cycle
  for (let i = 1; i <= yearsInCycle; i++) {
    days += LEAP_YEARS_IN_CYCLE.includes(i) ? LEAP_YEAR_DAYS : COMMON_YEAR_DAYS;
  }

  return days;
}
