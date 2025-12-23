/**
 * Intl-based Islamic Calendar Provider
 *
 * Uses Intl.DateTimeFormat with the islamic-umalqura calendar
 * extension for accurate Saudi Arabian official calendar calculations.
 *
 * This provider leverages the ICU/CLDR data built into the JavaScript runtime.
 */

import { CalendarProvider, IslamicCalendarType } from '../types';

/**
 * LRU Cache for month lengths
 */
class MonthLengthCache {
  private cache: Map<string, number>;
  private maxSize: number;

  constructor(maxSize: number = 500) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(year: number, month: number): number | undefined {
    const key = `${year}-${month}`;
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(year: number, month: number, length: number): void {
    const key = `${year}-${month}`;
    if (this.cache.size >= this.maxSize) {
      // Delete oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, length);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Intl-based Calendar Provider for Umm al-Qura calendar
 *
 * Uses Intl.DateTimeFormat with BCP 47 calendar extension
 * to leverage platform's ICU implementation.
 */
export class IntlCalendarProvider implements CalendarProvider {
  readonly type: IslamicCalendarType = 'islamic-umalqura';

  private formatter: Intl.DateTimeFormat;
  private monthLengthCache: MonthLengthCache;

  // Hijri epoch in milliseconds (approximately July 19, 622 CE)
  private static readonly HIJRI_EPOCH_MS = Date.UTC(622, 6, 19, 12, 0, 0);

  // Average Hijri year length in days
  private static readonly AVG_HIJRI_YEAR_DAYS = 354.36667;

  // Average Hijri month length in days
  private static readonly AVG_HIJRI_MONTH_DAYS = 29.530589;

  constructor() {
    // Use English locale with numeric output for easy parsing
    this.formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    });

    this.monthLengthCache = new MonthLengthCache();
  }

  /**
   * Convert a Gregorian Date to Hijri date components
   * Uses formatToParts() to extract numeric values
   */
  gregorianToHijri(date: Date): { year: number; month: number; day: number } {
    const parts = this.formatter.formatToParts(date);
    const result = { year: 0, month: 0, day: 0 };

    for (const part of parts) {
      switch (part.type) {
        case 'year':
          result.year = parseInt(part.value, 10);
          break;
        case 'month':
          result.month = parseInt(part.value, 10);
          break;
        case 'day':
          result.day = parseInt(part.value, 10);
          break;
      }
    }

    if (result.year === 0 || result.month === 0 || result.day === 0) {
      throw new Error(`Failed to parse Hijri date from: ${date.toISOString()}`);
    }

    return result;
  }

  /**
   * Convert Hijri date components to a Gregorian Date
   * Uses binary search to find the matching Gregorian date
   */
  hijriToGregorian(year: number, month: number, day: number): Date {
    // Estimate the Gregorian date
    const estimatedDays =
      (year - 1) * IntlCalendarProvider.AVG_HIJRI_YEAR_DAYS +
      (month - 1) * IntlCalendarProvider.AVG_HIJRI_MONTH_DAYS +
      day;

    const estimatedMs = IntlCalendarProvider.HIJRI_EPOCH_MS + estimatedDays * 86400000;

    // Binary search within a reasonable range (±60 days from estimate)
    let lowMs = estimatedMs - 60 * 86400000;
    let highMs = estimatedMs + 60 * 86400000;

    // Coarse search first (by day)
    while (highMs - lowMs > 86400000) {
      const midMs = Math.floor((lowMs + highMs) / 2);
      const midDate = new Date(midMs);
      const hijri = this.gregorianToHijri(midDate);

      const cmp = this.compareHijriDates(year, month, day, hijri.year, hijri.month, hijri.day);

      if (cmp === 0) {
        // Found it - return noon UTC
        return new Date(Date.UTC(midDate.getUTCFullYear(), midDate.getUTCMonth(), midDate.getUTCDate(), 12, 0, 0));
      } else if (cmp > 0) {
        lowMs = midMs;
      } else {
        highMs = midMs;
      }
    }

    // Fine search (day by day)
    for (let ms = lowMs; ms <= highMs; ms += 86400000) {
      const testDate = new Date(ms);
      const hijri = this.gregorianToHijri(testDate);

      if (hijri.year === year && hijri.month === month && hijri.day === day) {
        return new Date(Date.UTC(testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate(), 12, 0, 0));
      }
    }

    throw new Error(`Cannot convert Hijri date ${year}-${month}-${day} to Gregorian`);
  }

  /**
   * Get the number of days in a Hijri month
   * Uses probing: checks if day 30 exists
   */
  getMonthLength(year: number, month: number): number {
    if (month < 1 || month > 12) {
      throw new Error(`Invalid Hijri month: ${month}. Must be between 1 and 12.`);
    }

    // Check cache first
    const cached = this.monthLengthCache.get(year, month);
    if (cached !== undefined) {
      return cached;
    }

    // Probe: check if day 30 exists
    const length = this.isValidDate(year, month, 30) ? 30 : 29;

    this.monthLengthCache.set(year, month, length);
    return length;
  }

  /**
   * Check if a Hijri year is a leap year (has 355 days)
   */
  isLeapYear(year: number): boolean {
    // A year is a leap year if month 12 has 30 days
    return this.getMonthLength(year, 12) === 30;
  }

  /**
   * Get the total number of days in a Hijri year
   */
  getYearLength(year: number): number {
    return this.isLeapYear(year) ? 355 : 354;
  }

  /**
   * Validate if a Hijri date exists
   * Converts to Gregorian and back to verify
   */
  isValidDate(year: number, month: number, day: number): boolean {
    if (!Number.isInteger(year) || year < 1) {
      return false;
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return false;
    }
    if (!Number.isInteger(day) || day < 1 || day > 30) {
      return false;
    }

    try {
      const gregorian = this.hijriToGregorian(year, month, day);
      const converted = this.gregorianToHijri(gregorian);

      return (
        converted.year === year &&
        converted.month === month &&
        converted.day === day
      );
    } catch {
      return false;
    }
  }

  /**
   * Compare two Hijri dates
   * Returns: negative if first < second, 0 if equal, positive if first > second
   */
  private compareHijriDates(
    y1: number, m1: number, d1: number,
    y2: number, m2: number, d2: number
  ): number {
    if (y1 !== y2) return y1 - y2;
    if (m1 !== m2) return m1 - m2;
    return d1 - d2;
  }

  /**
   * Clear the internal cache
   */
  clearCache(): void {
    this.monthLengthCache.clear();
  }
}

/**
 * Singleton instance
 */
let instance: IntlCalendarProvider | null = null;

/**
 * Get the IntlCalendarProvider singleton
 */
export function getIntlProvider(): IntlCalendarProvider {
  if (!instance) {
    instance = new IntlCalendarProvider();
  }
  return instance;
}

/**
 * Check if Intl.DateTimeFormat supports the islamic-umalqura calendar
 */
export function isIntlUmalquraSupported(): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura');
    const resolved = formatter.resolvedOptions();
    return resolved.calendar === 'islamic-umalqura';
  } catch {
    return false;
  }
}
