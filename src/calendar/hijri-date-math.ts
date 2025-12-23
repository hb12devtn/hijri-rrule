import { HijriDate } from './hijri-date';
import { getMonthLength } from './hijri-calendar';
import {
  hijriToJulianDay,
  julianDayToHijri,
  hijriDayOfWeek,
} from './hijri-converter';
import { WeekdayNum } from '../types/weekday';

/**
 * Add days to a Hijri date
 *
 * @param date - Starting HijriDate
 * @param days - Number of days to add (can be negative)
 * @returns New HijriDate
 */
export function addDays(date: HijriDate, days: number): HijriDate {
  if (days === 0) return date.clone();

  const jdn = hijriToJulianDay(date);
  const newJdn = jdn + days;
  const result = julianDayToHijri(newJdn);

  // Preserve time from original date
  return new HijriDate(
    result.year,
    result.month,
    result.day,
    date.hour,
    date.minute,
    date.second
  );
}

/**
 * Add months to a Hijri date
 *
 * @param date - Starting HijriDate
 * @param months - Number of months to add (can be negative)
 * @param clampDay - If true, clamp day to max days in target month (default: true)
 * @returns New HijriDate, or null if clampDay is false and day doesn't exist
 */
export function addMonths(
  date: HijriDate,
  months: number,
  clampDay: boolean = true
): HijriDate | null {
  if (months === 0) return date.clone();

  // Calculate new year and month
  const totalMonths = (date.year - 1) * 12 + (date.month - 1) + months;
  let newYear = Math.floor(totalMonths / 12) + 1;
  let newMonth = (totalMonths % 12) + 1;

  // Handle negative months
  if (newMonth <= 0) {
    newMonth += 12;
    newYear -= 1;
  }

  if (newYear < 1) {
    throw new Error('Resulting date is before Hijri epoch');
  }

  // Check if day is valid in target month
  const maxDay = getMonthLength(newYear, newMonth);
  let newDay = date.day;

  if (date.day > maxDay) {
    if (clampDay) {
      newDay = maxDay;
    } else {
      return null; // Day doesn't exist in target month
    }
  }

  return new HijriDate(
    newYear,
    newMonth,
    newDay,
    date.hour,
    date.minute,
    date.second
  );
}

/**
 * Add years to a Hijri date
 *
 * @param date - Starting HijriDate
 * @param years - Number of years to add (can be negative)
 * @param clampDay - If true, clamp day to max days in target month (default: true)
 * @returns New HijriDate, or null if clampDay is false and day doesn't exist
 */
export function addYears(
  date: HijriDate,
  years: number,
  clampDay: boolean = true
): HijriDate | null {
  if (years === 0) return date.clone();

  const newYear = date.year + years;

  if (newYear < 1) {
    throw new Error('Resulting date is before Hijri epoch');
  }

  // Check if day is valid in target month of new year
  const maxDay = getMonthLength(newYear, date.month);
  let newDay = date.day;

  if (date.day > maxDay) {
    if (clampDay) {
      newDay = maxDay;
    } else {
      return null; // Day doesn't exist (e.g., 30 Dhu al-Hijjah in non-leap year)
    }
  }

  return new HijriDate(
    newYear,
    date.month,
    newDay,
    date.hour,
    date.minute,
    date.second
  );
}

/**
 * Calculate the difference in days between two Hijri dates
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days (date1 - date2), positive if date1 > date2
 */
export function diffDays(date1: HijriDate, date2: HijriDate): number {
  const jdn1 = hijriToJulianDay(date1);
  const jdn2 = hijriToJulianDay(date2);
  return Math.round(jdn1 - jdn2);
}

/**
 * Calculate the difference in months between two Hijri dates
 * Only counts complete months
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of months (date1 - date2)
 */
export function diffMonths(date1: HijriDate, date2: HijriDate): number {
  const months1 = (date1.year - 1) * 12 + (date1.month - 1);
  const months2 = (date2.year - 1) * 12 + (date2.month - 1);
  return months1 - months2;
}

/**
 * Calculate the difference in years between two Hijri dates
 * Only counts complete years
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of years (date1 - date2)
 */
export function diffYears(date1: HijriDate, date2: HijriDate): number {
  return date1.year - date2.year;
}

/**
 * Get the day of week for a Hijri date
 *
 * @param date - HijriDate
 * @returns WeekdayNum (0=Saturday, 1=Sunday, ..., 6=Friday)
 */
export function dayOfWeek(date: HijriDate): WeekdayNum {
  return hijriDayOfWeek(date) as WeekdayNum;
}

/**
 * Get the first day of the month
 *
 * @param date - HijriDate
 * @returns New HijriDate on the first day of the month
 */
export function startOfMonth(date: HijriDate): HijriDate {
  return new HijriDate(
    date.year,
    date.month,
    1,
    date.hour,
    date.minute,
    date.second
  );
}

/**
 * Get the last day of the month
 *
 * @param date - HijriDate
 * @returns New HijriDate on the last day of the month
 */
export function endOfMonth(date: HijriDate): HijriDate {
  const lastDay = getMonthLength(date.year, date.month);
  return new HijriDate(
    date.year,
    date.month,
    lastDay,
    date.hour,
    date.minute,
    date.second
  );
}

/**
 * Get the first day of the year
 *
 * @param date - HijriDate
 * @returns New HijriDate on 1 Muharram of the same year
 */
export function startOfYear(date: HijriDate): HijriDate {
  return new HijriDate(date.year, 1, 1, date.hour, date.minute, date.second);
}

/**
 * Get the last day of the year
 *
 * @param date - HijriDate
 * @returns New HijriDate on 29/30 Dhu al-Hijjah of the same year
 */
export function endOfYear(date: HijriDate): HijriDate {
  const lastDay = getMonthLength(date.year, 12);
  return new HijriDate(date.year, 12, lastDay, date.hour, date.minute, date.second);
}

/**
 * Get the start of the week containing the given date
 *
 * @param date - HijriDate
 * @param weekStart - The day that starts the week (default: Sunday)
 * @returns New HijriDate on the first day of the week
 */
export function startOfWeek(
  date: HijriDate,
  weekStart: WeekdayNum = WeekdayNum.SU
): HijriDate {
  const currentDay = dayOfWeek(date);
  const daysToSubtract = (currentDay - weekStart + 7) % 7;
  return addDays(date, -daysToSubtract);
}

/**
 * Get the end of the week containing the given date
 *
 * @param date - HijriDate
 * @param weekStart - The day that starts the week (default: Sunday)
 * @returns New HijriDate on the last day of the week
 */
export function endOfWeek(
  date: HijriDate,
  weekStart: WeekdayNum = WeekdayNum.SU
): HijriDate {
  const weekEnd = (weekStart + 6) % 7;
  const currentDay = dayOfWeek(date);
  const daysToAdd = (weekEnd - currentDay + 7) % 7;
  return addDays(date, daysToAdd);
}

/**
 * Get the nth weekday of a month
 *
 * @param year - Hijri year
 * @param month - Hijri month (1-12)
 * @param weekday - Day of week (0-6)
 * @param n - Which occurrence (1=first, 2=second, -1=last, -2=second last)
 * @returns HijriDate or null if not found
 */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: WeekdayNum,
  n: number
): HijriDate | null {
  if (n === 0) return null;

  const monthLength = getMonthLength(year, month);

  if (n > 0) {
    // Find nth occurrence from the start
    let count = 0;
    for (let day = 1; day <= monthLength; day++) {
      const date = new HijriDate(year, month, day);
      if (dayOfWeek(date) === weekday) {
        count++;
        if (count === n) {
          return date;
        }
      }
    }
  } else {
    // Find nth occurrence from the end
    let count = 0;
    for (let day = monthLength; day >= 1; day--) {
      const date = new HijriDate(year, month, day);
      if (dayOfWeek(date) === weekday) {
        count--;
        if (count === n) {
          return date;
        }
      }
    }
  }

  return null; // Not enough occurrences
}

/**
 * Get the week number within the year (ISO-like, but starting from specified day)
 *
 * @param date - HijriDate
 * @param weekStart - The day that starts the week (default: Sunday)
 * @returns Week number (1-52 or 53)
 */
export function weekOfYear(
  date: HijriDate,
  weekStart: WeekdayNum = WeekdayNum.SU
): number {
  const firstDayOfYear = new HijriDate(date.year, 1, 1);
  const firstDayWeekday = dayOfWeek(firstDayOfYear);

  // Days until the first full week starts
  const daysUntilFirstFullWeek = (weekStart - firstDayWeekday + 7) % 7;

  const dayOfYear = date.getDayOfYear();

  if (dayOfYear <= daysUntilFirstFullWeek) {
    // Day is in "week 0" (partial first week) - count as week 1
    return 1;
  }

  // Subtract the partial first week and calculate week number
  const daysInFullWeeks = dayOfYear - daysUntilFirstFullWeek;
  return Math.ceil(daysInFullWeeks / 7) + (daysUntilFirstFullWeek > 0 ? 1 : 0);
}

/**
 * Check if two dates are in the same year
 */
export function isSameYear(date1: HijriDate, date2: HijriDate): boolean {
  return date1.year === date2.year;
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: HijriDate, date2: HijriDate): boolean {
  return date1.year === date2.year && date1.month === date2.month;
}

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(
  date1: HijriDate,
  date2: HijriDate,
  weekStart: WeekdayNum = WeekdayNum.SU
): boolean {
  const start1 = startOfWeek(date1, weekStart);
  const start2 = startOfWeek(date2, weekStart);
  return start1.equals(start2);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: HijriDate, date2: HijriDate): boolean {
  return date1.equals(date2);
}
