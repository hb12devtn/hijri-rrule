import {
  HIJRI_EPOCH_JD,
  LUNAR_CYCLE_YEARS,
  LUNAR_CYCLE_DAYS,
  LEAP_YEARS_IN_CYCLE,
  COMMON_YEAR_DAYS,
  LEAP_YEAR_DAYS,
} from '../constants/calendar';
import { HijriDate } from './hijri-date';
import { getMonthLength } from './hijri-calendar';
import { IslamicCalendarType } from './types';
import { getCalendarProvider } from './providers';

/**
 * Convert a Gregorian Date to Julian Day Number (JDN)
 *
 * The Julian Day Number is a continuous count of days since the
 * beginning of the Julian Period (January 1, 4713 BC, Julian calendar)
 *
 * @param date - JavaScript Date object
 * @returns Julian Day Number (including fractional day for time)
 */
export function gregorianToJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  // Calculate the integer part of JDN using the algorithm from
  // "Astronomical Algorithms" by Jean Meeus
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  // For Gregorian calendar
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Add fractional day for time
  const fraction = (hour - 12) / 24 + minute / 1440 + second / 86400;

  return jdn + fraction;
}

/**
 * Convert Julian Day Number to Gregorian Date
 *
 * @param jdn - Julian Day Number
 * @returns JavaScript Date object
 */
export function julianDayToGregorian(jdn: number): Date {
  // Integer and fractional parts
  const z = Math.floor(jdn + 0.5);
  const f = jdn + 0.5 - z;

  let a = z;
  if (z >= 2299161) {
    // Gregorian calendar
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

  // Calculate time from fractional day
  const totalSeconds = Math.round(f * 86400);
  const hour = Math.floor(totalSeconds / 3600) + 12;
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = totalSeconds % 60;

  return new Date(Date.UTC(year, month - 1, day, hour % 24, minute, second));
}

/**
 * Convert a Hijri date to Julian Day Number
 *
 * Uses the Tabular Islamic Calendar algorithm
 *
 * @param hijriDate - HijriDate object or {year, month, day}
 * @returns Julian Day Number
 */
export function hijriToJulianDay(hijriDate: {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}): number {
  const { year, month, day, hour = 0, minute = 0, second = 0 } = hijriDate;

  // Calculate the number of days from Hijri epoch
  // Using the tabular algorithm

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
    days += getMonthLength(year, m);
  }

  // Add day of month (minus 1 because epoch is day 1)
  days += day - 1;

  // Add fractional day for time
  const fraction = (hour - 12) / 24 + minute / 1440 + second / 86400;

  return HIJRI_EPOCH_JD + days + fraction;
}

/**
 * Convert Julian Day Number to Hijri date
 *
 * @param jdn - Julian Day Number
 * @returns HijriDate object
 */
export function julianDayToHijri(jdn: number): HijriDate {
  // Days since Hijri epoch
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
    const yearLength = LEAP_YEARS_IN_CYCLE.includes(y)
      ? LEAP_YEAR_DAYS
      : COMMON_YEAR_DAYS;

    if (remainingDays < yearLength) {
      year += y;
      break;
    }
    remainingDays -= yearLength;

    if (y === LUNAR_CYCLE_YEARS) {
      // Edge case: exactly at the end of a cycle
      year += LUNAR_CYCLE_YEARS;
      remainingDays = 0;
    }
  }

  // Calculate month and day
  let month = 1;
  for (let m = 1; m <= 12; m++) {
    const monthLength = getMonthLength(year, m);
    if (remainingDays < monthLength) {
      month = m;
      break;
    }
    remainingDays -= monthLength;

    if (m === 12) {
      // Edge case: last day of year
      month = 12;
    }
  }

  const day = remainingDays + 1;

  // Calculate time from fractional part
  const fraction = jdn - Math.floor(jdn) + 0.5;
  const totalSeconds = Math.round((fraction % 1) * 86400);
  const hour = Math.floor(totalSeconds / 3600);
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = totalSeconds % 60;

  return new HijriDate(year, month, day, hour, minute, second);
}

/**
 * Convert Gregorian Date to Hijri Date
 *
 * @param date - JavaScript Date object
 * @param calendar - Calendar type to use (defaults to global config)
 * @returns HijriDate object
 */
export function gregorianToHijri(date: Date, calendar?: IslamicCalendarType): HijriDate {
  const provider = getCalendarProvider(calendar);
  const { year, month, day } = provider.gregorianToHijri(date);
  return new HijriDate(year, month, day);
}

/**
 * Convert Hijri Date to Gregorian Date
 *
 * @param hijriDate - HijriDate object or {year, month, day}
 * @param calendar - Calendar type to use (defaults to global config)
 * @returns JavaScript Date object
 */
export function hijriToGregorian(
  hijriDate: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    second?: number;
  },
  calendar?: IslamicCalendarType
): Date {
  const provider = getCalendarProvider(calendar);
  return provider.hijriToGregorian(hijriDate.year, hijriDate.month, hijriDate.day);
}

/**
 * Get the day of week for a Hijri date
 * Returns 0=Saturday, 1=Sunday, ..., 6=Friday (Islamic week)
 *
 * @param hijriDate - HijriDate object or {year, month, day}
 * @returns Day of week (0-6)
 */
export function hijriDayOfWeek(hijriDate: {
  year: number;
  month: number;
  day: number;
}): number {
  const jdn = hijriToJulianDay(hijriDate);
  // JDN 0 was a Monday
  // We want 0 = Saturday
  // Monday = 2 in our system
  // JDN mod 7: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  // Our system: 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
  const jdnMod7 = Math.floor(jdn + 0.5) % 7;
  // Map: jdnMod7 -> our system
  // 0 (Mon) -> 2
  // 1 (Tue) -> 3
  // 2 (Wed) -> 4
  // 3 (Thu) -> 5
  // 4 (Fri) -> 6
  // 5 (Sat) -> 0
  // 6 (Sun) -> 1
  return (jdnMod7 + 2) % 7;
}

// Initialize HijriDate.prototype.toGregorian
// This avoids circular dependency by monkey-patching after load
HijriDate.prototype.toGregorian = function (): Date {
  return hijriToGregorian(this);
};

/**
 * Create a HijriDate from a Gregorian Date
 * Convenience method
 */
HijriDate.fromGregorian = function (date: Date): HijriDate {
  return gregorianToHijri(date);
};

// Add static method declaration to HijriDate
declare module './hijri-date' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace HijriDate {
    function fromGregorian(date: Date): HijriDate;
  }
}
