import { HijriDateLike } from '../types/options';
import { MONTH_NAMES_EN, MONTH_NAMES_AR } from '../constants/months';
import {
  isValidHijriDate,
  getMonthLength,
  getDayOfYear,
  getYearLength,
} from './hijri-calendar';

/**
 * Immutable value object representing a date in the Hijri calendar
 */
export class HijriDate implements HijriDateLike {
  /** The Hijri year (1+) */
  public readonly year: number;

  /** The Hijri month (1-12, where 1=Muharram, 9=Ramadan, 12=Dhu al-Hijjah) */
  public readonly month: number;

  /** The day of the month (1-30) */
  public readonly day: number;

  /** Optional time components */
  public readonly hour: number;
  public readonly minute: number;
  public readonly second: number;

  /**
   * Create a new HijriDate
   *
   * @param year - The Hijri year (must be >= 1)
   * @param month - The Hijri month (1-12)
   * @param day - The day of the month (1-30)
   * @param hour - Hour (0-23), defaults to 0
   * @param minute - Minute (0-59), defaults to 0
   * @param second - Second (0-59), defaults to 0
   */
  constructor(
    year: number,
    month: number,
    day: number,
    hour: number = 0,
    minute: number = 0,
    second: number = 0
  ) {
    if (!isValidHijriDate(year, month, day)) {
      const maxDay = month >= 1 && month <= 12 ? getMonthLength(year, month) : 30;
      throw new Error(
        `Invalid Hijri date: ${year}-${month}-${day}. ` +
          `Month ${month} in year ${year} has ${maxDay} days.`
      );
    }

    if (hour < 0 || hour > 23 || !Number.isInteger(hour)) {
      throw new Error(`Invalid hour: ${hour}. Must be integer between 0 and 23.`);
    }

    if (minute < 0 || minute > 59 || !Number.isInteger(minute)) {
      throw new Error(`Invalid minute: ${minute}. Must be integer between 0 and 59.`);
    }

    if (second < 0 || second > 59 || !Number.isInteger(second)) {
      throw new Error(`Invalid second: ${second}. Must be integer between 0 and 59.`);
    }

    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.second = second;
  }

  /**
   * Create a HijriDate from a plain object
   */
  static from(obj: HijriDateLike): HijriDate {
    if (obj instanceof HijriDate) {
      return obj;
    }
    return new HijriDate(obj.year, obj.month, obj.day);
  }

  /**
   * Convert to Gregorian Date
   * This is implemented by HijriConverter to avoid circular dependency
   * Placeholder that will be replaced at runtime
   */
  toGregorian(): Date {
    // This will be overridden by hijri-converter.ts
    throw new Error('HijriDate.toGregorian not initialized. Import hijri-converter first.');
  }

  /**
   * Create a copy of this date
   */
  clone(): HijriDate {
    return new HijriDate(
      this.year,
      this.month,
      this.day,
      this.hour,
      this.minute,
      this.second
    );
  }

  /**
   * Check if this date equals another date
   */
  equals(other: HijriDateLike): boolean {
    return (
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    );
  }

  /**
   * Check if this date is before another date
   */
  isBefore(other: HijriDateLike): boolean {
    if (this.year !== other.year) return this.year < other.year;
    if (this.month !== other.month) return this.month < other.month;
    return this.day < other.day;
  }

  /**
   * Check if this date is after another date
   */
  isAfter(other: HijriDateLike): boolean {
    if (this.year !== other.year) return this.year > other.year;
    if (this.month !== other.month) return this.month > other.month;
    return this.day > other.day;
  }

  /**
   * Check if this date is on or before another date
   */
  isOnOrBefore(other: HijriDateLike): boolean {
    return this.equals(other) || this.isBefore(other);
  }

  /**
   * Check if this date is on or after another date
   */
  isOnOrAfter(other: HijriDateLike): boolean {
    return this.equals(other) || this.isAfter(other);
  }

  /**
   * Compare this date with another date
   * Returns negative if this < other, 0 if equal, positive if this > other
   */
  compare(other: HijriDateLike): number {
    if (this.year !== other.year) return this.year - other.year;
    if (this.month !== other.month) return this.month - other.month;
    return this.day - other.day;
  }

  /**
   * Get day of year (1-355)
   */
  getDayOfYear(): number {
    return getDayOfYear(this.year, this.month, this.day);
  }

  /**
   * Get the number of days in this month
   */
  getDaysInMonth(): number {
    return getMonthLength(this.year, this.month);
  }

  /**
   * Get the number of days in this year
   */
  getDaysInYear(): number {
    return getYearLength(this.year);
  }

  /**
   * Format as ISO-like string: YYYY-MM-DD
   */
  toString(): string {
    const y = String(this.year).padStart(4, '0');
    const m = String(this.month).padStart(2, '0');
    const d = String(this.day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Format as ISO-like string with time: YYYY-MM-DDTHH:MM:SS
   */
  toISOString(): string {
    const date = this.toString();
    const h = String(this.hour).padStart(2, '0');
    const m = String(this.minute).padStart(2, '0');
    const s = String(this.second).padStart(2, '0');
    return `${date}T${h}:${m}:${s}`;
  }

  /**
   * Format with month name in English
   * e.g., "1 Ramadan 1446"
   */
  toLocaleDateString(locale: 'en' | 'ar' = 'en'): string {
    const monthNames = locale === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;
    const monthName = monthNames[this.month];

    if (locale === 'ar') {
      return `${this.day} ${monthName} ${this.year}`;
    }
    return `${this.day} ${monthName} ${this.year} AH`;
  }

  /**
   * Format for RRULE DTSTART: YYYYMMDD or YYYYMMDDTHHMMSS
   */
  toRRuleString(includeTime: boolean = false): string {
    const y = String(this.year).padStart(4, '0');
    const m = String(this.month).padStart(2, '0');
    const d = String(this.day).padStart(2, '0');

    if (!includeTime && this.hour === 0 && this.minute === 0 && this.second === 0) {
      return `${y}${m}${d}`;
    }

    const hh = String(this.hour).padStart(2, '0');
    const mm = String(this.minute).padStart(2, '0');
    const ss = String(this.second).padStart(2, '0');
    return `${y}${m}${d}T${hh}${mm}${ss}`;
  }

  /**
   * Create from RRULE format string: YYYYMMDD or YYYYMMDDTHHMMSS
   */
  static fromRRuleString(str: string): HijriDate {
    const datePattern = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2}))?$/;
    const match = str.match(datePattern);

    if (!match) {
      throw new Error(`Invalid RRULE date string: ${str}`);
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const hour = match[5] ? parseInt(match[5], 10) : 0;
    const minute = match[6] ? parseInt(match[6], 10) : 0;
    const second = match[7] ? parseInt(match[7], 10) : 0;

    return new HijriDate(year, month, day, hour, minute, second);
  }

  /**
   * Get a JSON representation
   */
  toJSON(): { year: number; month: number; day: number } {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
    };
  }

  /**
   * Value of the date (for comparisons)
   */
  valueOf(): number {
    // Return a numeric value for comparison
    // Format: YYYYMMDD as a number
    return this.year * 10000 + this.month * 100 + this.day;
  }
}

/**
 * Helper function to create a HijriDate
 * Mirrors the datetime() helper in jkbrzt/rrule
 */
export function hijriDate(
  year: number,
  month: number,
  day: number,
  hour?: number,
  minute?: number,
  second?: number
): HijriDate {
  return new HijriDate(year, month, day, hour, minute, second);
}
