import { PartialOptions, ParsedOptions, HijriDateLike } from '../types/options';
import { HijriDate } from '../calendar/hijri-date';
import { gregorianToHijri, hijriToGregorian } from '../calendar/hijri-converter';
import { HijriWeekday } from '../weekday/hijri-weekday';
import { parseOptions, optionsToPartial } from '../core/options-parser';
import { parseString } from '../core/string-parser';
import { optionsToString } from '../core/string-serializer';
import { iterate, getAfter, getBefore } from '../core/iterator';
import { RRuleCache } from '../core/cache';

// Import constants for static properties
import { YEARLY, MONTHLY, WEEKLY, DAILY, HOURLY, MINUTELY, SECONDLY } from '../constants/frequency';
import { SA, SU, MO, TU, WE, TH, FR } from '../constants/weekday';
import {
  MUHARRAM, SAFAR, RABI_AL_AWWAL, RABI_AL_THANI,
  JUMADA_AL_AWWAL, JUMADA_AL_THANI, RAJAB, SHABAN,
  RAMADAN, SHAWWAL, DHU_AL_QADAH, DHU_AL_HIJJAH
} from '../constants/months';

/**
 * Iterator callback function type
 */
export type IteratorCallback = (date: Date, index: number) => boolean | void;

/**
 * Main HijriRRule class for working with Hijri calendar recurrence rules
 *
 * @example
 * ```typescript
 * const rule = new HijriRRule({
 *   freq: HijriRRule.YEARLY,
 *   bymonth: 9,  // Ramadan
 *   bymonthday: 1,
 *   dtstart: new HijriDate(1446, 9, 1),
 *   count: 5
 * });
 *
 * const dates = rule.all();
 * ```
 */
export class HijriRRule {
  // Frequency constants
  static readonly YEARLY = YEARLY;
  static readonly MONTHLY = MONTHLY;
  static readonly WEEKLY = WEEKLY;
  static readonly DAILY = DAILY;
  static readonly HOURLY = HOURLY;
  static readonly MINUTELY = MINUTELY;
  static readonly SECONDLY = SECONDLY;

  // Weekday constants
  static readonly SA = SA;
  static readonly SU = SU;
  static readonly MO = MO;
  static readonly TU = TU;
  static readonly WE = WE;
  static readonly TH = TH;
  static readonly FR = FR;

  // Month constants
  static readonly MUHARRAM = MUHARRAM;
  static readonly SAFAR = SAFAR;
  static readonly RABI_AL_AWWAL = RABI_AL_AWWAL;
  static readonly RABI_AL_THANI = RABI_AL_THANI;
  static readonly JUMADA_AL_AWWAL = JUMADA_AL_AWWAL;
  static readonly JUMADA_AL_THANI = JUMADA_AL_THANI;
  static readonly RAJAB = RAJAB;
  static readonly SHABAN = SHABAN;
  static readonly RAMADAN = RAMADAN;
  static readonly SHAWWAL = SHAWWAL;
  static readonly DHU_AL_QADAH = DHU_AL_QADAH;
  static readonly DHU_AL_HIJJAH = DHU_AL_HIJJAH;

  /** Parsed options */
  public readonly options: ParsedOptions;

  /** Original options passed to constructor */
  public readonly origOptions: PartialOptions;

  /** Cache for computed results */
  private cache: RRuleCache | null = null;

  /**
   * Create a new HijriRRule
   *
   * @param options - Rule options
   * @param noCache - If true, disable caching (default: false)
   */
  constructor(options: PartialOptions, noCache: boolean = false) {
    this.origOptions = { ...options };
    this.options = parseOptions(options);

    if (!noCache) {
      this.cache = new RRuleCache();
    }
  }

  /**
   * Get all occurrences as JavaScript Date objects
   *
   * @param iterator - Optional callback function. If it returns false, iteration stops.
   * @returns Array of Date objects
   */
  all(iterator?: IteratorCallback): Date[] {
    const hijriDates = this.allHijri(iterator ? (d, i) => {
      return iterator(this.hijriToGreg(d), i);
    } : undefined);

    return hijriDates.map((d) => this.hijriToGreg(d));
  }

  /**
   * Get all occurrences as HijriDate objects
   *
   * @param iterator - Optional callback function. If it returns false, iteration stops.
   * @returns Array of HijriDate objects
   */
  allHijri(iterator?: (date: HijriDate, index: number) => boolean | void): HijriDate[] {
    // Check cache
    if (this.cache?.hasAll() && !iterator) {
      return this.cache.getAll()!;
    }

    const result: HijriDate[] = [];
    let index = 0;

    for (const date of iterate(this.options)) {
      if (iterator) {
        const shouldContinue = iterator(date, index);
        if (shouldContinue === false) {
          break;
        }
      }
      result.push(date);
      index++;
    }

    // Cache if no iterator was used
    if (!iterator && this.cache) {
      this.cache.setAll(result);
    }

    return result;
  }

  /**
   * Get occurrences between two dates as JavaScript Date objects
   *
   * @param after - Start date (exclusive by default)
   * @param before - End date (exclusive by default)
   * @param inc - If true, include dates equal to after/before (default: false)
   * @param iterator - Optional callback function
   * @returns Array of Date objects
   */
  between(
    after: Date | HijriDateLike,
    before: Date | HijriDateLike,
    inc: boolean = false,
    iterator?: IteratorCallback
  ): Date[] {
    const hijriDates = this.betweenHijri(after, before, inc, iterator ? (d, i) => {
      return iterator(this.hijriToGreg(d), i);
    } : undefined);

    return hijriDates.map((d) => this.hijriToGreg(d));
  }

  /**
   * Get occurrences between two dates as HijriDate objects
   */
  betweenHijri(
    after: Date | HijriDateLike,
    before: Date | HijriDateLike,
    inc: boolean = false,
    iterator?: (date: HijriDate, index: number) => boolean | void
  ): HijriDate[] {
    const afterHijri = this.toHijriDate(after);
    const beforeHijri = this.toHijriDate(before);

    // Check cache
    if (!iterator) {
      const cached = this.cache?.getBetween(afterHijri, beforeHijri, inc);
      if (cached) return cached;
    }

    const result: HijriDate[] = [];
    let index = 0;

    for (const date of iterate(this.options)) {
      // Stop if past 'before' date
      if (inc ? date.isAfter(beforeHijri) : date.isOnOrAfter(beforeHijri)) {
        if (!date.equals(beforeHijri) || !inc) break;
      }

      // Include if within range
      const isAfterStart = inc
        ? date.isOnOrAfter(afterHijri)
        : date.isAfter(afterHijri);
      const isBeforeEnd = inc
        ? date.isOnOrBefore(beforeHijri)
        : date.isBefore(beforeHijri);

      if (isAfterStart && isBeforeEnd) {
        if (iterator) {
          const shouldContinue = iterator(date, index);
          if (shouldContinue === false) break;
        }
        result.push(date);
        index++;
      }
    }

    // Cache if no iterator was used
    if (!iterator && this.cache) {
      this.cache.setBetween(afterHijri, beforeHijri, inc, result);
    }

    return result;
  }

  /**
   * Get the first occurrence after a date
   *
   * @param dt - The reference date
   * @param inc - If true, include date if it's an occurrence (default: false)
   * @returns Date object or null
   */
  after(dt: Date | HijriDateLike, inc: boolean = false): Date | null {
    const hijriDate = this.afterHijri(dt, inc);
    return hijriDate ? this.hijriToGreg(hijriDate) : null;
  }

  /**
   * Get the first occurrence after a date as HijriDate
   */
  afterHijri(dt: Date | HijriDateLike, inc: boolean = false): HijriDate | null {
    const dtHijri = this.toHijriDate(dt);

    // Check cache
    const cached = this.cache?.getAfter(dtHijri, inc);
    if (cached !== undefined) return cached;

    const result = getAfter(this.options, dtHijri, inc);

    // Cache result
    if (this.cache) {
      this.cache.setAfter(dtHijri, inc, result);
    }

    return result;
  }

  /**
   * Get the last occurrence before a date
   *
   * @param dt - The reference date
   * @param inc - If true, include date if it's an occurrence (default: false)
   * @returns Date object or null
   */
  before(dt: Date | HijriDateLike, inc: boolean = false): Date | null {
    const hijriDate = this.beforeHijri(dt, inc);
    return hijriDate ? this.hijriToGreg(hijriDate) : null;
  }

  /**
   * Get the last occurrence before a date as HijriDate
   */
  beforeHijri(dt: Date | HijriDateLike, inc: boolean = false): HijriDate | null {
    const dtHijri = this.toHijriDate(dt);

    // Check cache
    const cached = this.cache?.getBefore(dtHijri, inc);
    if (cached !== undefined) return cached;

    const result = getBefore(this.options, dtHijri, inc);

    // Cache result
    if (this.cache) {
      this.cache.setBefore(dtHijri, inc, result);
    }

    return result;
  }

  /**
   * Get the count of occurrences
   * Note: For infinite rules, this will return the limit count
   */
  count(): number {
    if (this.options.count !== undefined) {
      return this.options.count;
    }
    // For rules without count, we need to iterate
    return this.allHijri().length;
  }

  /**
   * Convert to RRULE string representation
   */
  toString(): string {
    return optionsToString(this.options);
  }

  /**
   * Convert to human-readable text
   * Note: This is a placeholder - full NLP implementation is in nlp module
   */
  toText(_locale: 'en' | 'ar' = 'en'): string {
    // Basic implementation - full version in nlp/to-text.ts
    const freq = ['yearly', 'monthly', 'weekly', 'daily'][this.options.freq];
    let text = `every ${this.options.interval > 1 ? this.options.interval + ' ' : ''}${freq}`;

    if (this.options.bymonth) {
      text += ` in month ${this.options.bymonth.join(', ')}`;
    }

    if (this.options.bymonthday) {
      text += ` on day ${this.options.bymonthday.join(', ')}`;
    }

    if (this.options.count) {
      text += ` for ${this.options.count} times`;
    }

    return text;
  }

  /**
   * Clone this rule
   */
  clone(): HijriRRule {
    return new HijriRRule(optionsToPartial(this.options), this.cache === null);
  }

  /**
   * Create an iterator for this rule
   */
  *[Symbol.iterator](): Generator<Date> {
    for (const date of iterate(this.options)) {
      yield this.hijriToGreg(date);
    }
  }

  /**
   * Create a Hijri date iterator
   */
  *iterateHijri(): Generator<HijriDate> {
    yield* iterate(this.options);
  }

  // Static methods

  /**
   * Create an HijriRRule from an RRULE string
   *
   * @param str - RRULE string
   * @param noCache - If true, disable caching
   * @returns HijriRRule instance
   */
  static fromString(str: string, noCache: boolean = false): HijriRRule {
    const options = parseString(str);
    return new HijriRRule(options, noCache);
  }

  /**
   * Parse an RRULE string into options without creating an instance
   *
   * @param str - RRULE string
   * @returns Partial options object
   */
  static parseString(str: string): PartialOptions {
    return parseString(str);
  }

  /**
   * Convert options to RRULE string
   *
   * @param options - Partial or parsed options
   * @returns RRULE string
   */
  static optionsToString(options: PartialOptions | ParsedOptions): string {
    return optionsToString(options);
  }

  // Helper methods

  /**
   * Convert Date or HijriDateLike to HijriDate using this rule's calendar
   */
  private toHijriDate(value: Date | HijriDateLike): HijriDate {
    if (value instanceof Date) {
      return gregorianToHijri(value, this.options.calendar);
    }
    if (value instanceof HijriDate) {
      return value;
    }
    return new HijriDate(value.year, value.month, value.day);
  }

  /**
   * Convert HijriDate to Gregorian Date using this rule's calendar
   */
  private hijriToGreg(hijriDate: HijriDate): Date {
    return hijriToGregorian(hijriDate, this.options.calendar);
  }
}

// Re-export HijriWeekday for convenience
export { HijriWeekday };
