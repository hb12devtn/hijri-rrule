import { HijriDate } from '../calendar/hijri-date';
import { gregorianToHijri } from '../calendar/hijri-converter';
import { HijriDateLike } from '../types/options';
import { HijriRRule, IteratorCallback } from './hijri-rrule';
import { RRuleCache } from '../core/cache';

/**
 * HijriRRuleSet - Combines multiple RRules, RDATEs, EXRULEs, and EXDATEs
 *
 * Allows for complex recurrence patterns with inclusions and exclusions.
 *
 * @example
 * ```typescript
 * const ruleSet = new HijriRRuleSet();
 *
 * // Add a rule for 1st of every month
 * ruleSet.rrule(new HijriRRule({
 *   freq: HijriRRule.MONTHLY,
 *   bymonthday: 1,
 *   dtstart: new HijriDate(1446, 1, 1)
 * }));
 *
 * // Add specific dates
 * ruleSet.rdate(new HijriDate(1446, 6, 15));
 *
 * // Exclude certain dates
 * ruleSet.exdate(new HijriDate(1446, 3, 1));
 *
 * const dates = ruleSet.all();
 * ```
 */
export class HijriRRuleSet {
  private _rrules: HijriRRule[] = [];
  private _rdates: HijriDate[] = [];
  private _exrules: HijriRRule[] = [];
  private _exdates: HijriDate[] = [];
  private _tzid?: string;
  private cache: RRuleCache | null = null;

  /**
   * Create a new HijriRRuleSet
   *
   * @param noCache - If true, disable caching (default: false)
   */
  constructor(noCache: boolean = false) {
    if (!noCache) {
      this.cache = new RRuleCache();
    }
  }

  /**
   * Add an RRule to the set
   */
  rrule(rule: HijriRRule): void {
    this._rrules.push(rule);
    this.clearCache();
  }

  /**
   * Add a date to the set
   */
  rdate(date: Date | HijriDateLike): void {
    this._rdates.push(this.toHijriDate(date));
    this.clearCache();
  }

  /**
   * Add an exclusion rule to the set
   */
  exrule(rule: HijriRRule): void {
    this._exrules.push(rule);
    this.clearCache();
  }

  /**
   * Add an exclusion date to the set
   */
  exdate(date: Date | HijriDateLike): void {
    this._exdates.push(this.toHijriDate(date));
    this.clearCache();
  }

  /**
   * Set or get the timezone
   */
  tzid(tz?: string): string | undefined {
    if (tz !== undefined) {
      this._tzid = tz;
    }
    return this._tzid;
  }

  /**
   * Get all RRules
   */
  rrules(): HijriRRule[] {
    return [...this._rrules];
  }

  /**
   * Get all RDATEs as HijriDate
   */
  rdatesHijri(): HijriDate[] {
    return [...this._rdates];
  }

  /**
   * Get all RDATEs as Date
   */
  rdates(): Date[] {
    return this._rdates.map((d) => d.toGregorian());
  }

  /**
   * Get all EXRULEs
   */
  exrules(): HijriRRule[] {
    return [...this._exrules];
  }

  /**
   * Get all EXDATEs as HijriDate
   */
  exdatesHijri(): HijriDate[] {
    return [...this._exdates];
  }

  /**
   * Get all EXDATEs as Date
   */
  exdates(): Date[] {
    return this._exdates.map((d) => d.toGregorian());
  }

  /**
   * Get all occurrences as JavaScript Date objects
   *
   * @param iterator - Optional callback function
   * @returns Array of Date objects
   */
  all(iterator?: IteratorCallback): Date[] {
    const hijriDates = this.allHijri(
      iterator
        ? (d, i) => iterator(d.toGregorian(), i)
        : undefined
    );
    return hijriDates.map((d) => d.toGregorian());
  }

  /**
   * Get all occurrences as HijriDate objects
   */
  allHijri(
    iterator?: (date: HijriDate, index: number) => boolean | void
  ): HijriDate[] {
    // Check cache
    if (this.cache?.hasAll() && !iterator) {
      return this.cache.getAll()!;
    }

    const result = this.generateOccurrences();

    if (iterator) {
      const filtered: HijriDate[] = [];
      for (let i = 0; i < result.length; i++) {
        const shouldContinue = iterator(result[i], i);
        if (shouldContinue === false) break;
        filtered.push(result[i]);
      }
      return filtered;
    }

    // Cache if no iterator
    if (this.cache) {
      this.cache.setAll(result);
    }

    return result;
  }

  /**
   * Get occurrences between two dates
   */
  between(
    after: Date | HijriDateLike,
    before: Date | HijriDateLike,
    inc: boolean = false,
    iterator?: IteratorCallback
  ): Date[] {
    const hijriDates = this.betweenHijri(
      after,
      before,
      inc,
      iterator ? (d, i) => iterator(d.toGregorian(), i) : undefined
    );
    return hijriDates.map((d) => d.toGregorian());
  }

  /**
   * Get occurrences between two dates as HijriDate
   */
  betweenHijri(
    after: Date | HijriDateLike,
    before: Date | HijriDateLike,
    inc: boolean = false,
    iterator?: (date: HijriDate, index: number) => boolean | void
  ): HijriDate[] {
    const afterHijri = this.toHijriDate(after);
    const beforeHijri = this.toHijriDate(before);

    const all = this.allHijri();
    const result: HijriDate[] = [];
    let index = 0;

    for (const date of all) {
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

      // Stop if past the end
      if (date.isAfter(beforeHijri)) break;
    }

    return result;
  }

  /**
   * Get the first occurrence after a date
   */
  after(dt: Date | HijriDateLike, inc: boolean = false): Date | null {
    const hijriDate = this.afterHijri(dt, inc);
    return hijriDate ? hijriDate.toGregorian() : null;
  }

  /**
   * Get the first occurrence after a date as HijriDate
   */
  afterHijri(dt: Date | HijriDateLike, inc: boolean = false): HijriDate | null {
    const dtHijri = this.toHijriDate(dt);
    const all = this.allHijri();

    for (const date of all) {
      if (inc ? date.isOnOrAfter(dtHijri) : date.isAfter(dtHijri)) {
        return date;
      }
    }

    return null;
  }

  /**
   * Get the last occurrence before a date
   */
  before(dt: Date | HijriDateLike, inc: boolean = false): Date | null {
    const hijriDate = this.beforeHijri(dt, inc);
    return hijriDate ? hijriDate.toGregorian() : null;
  }

  /**
   * Get the last occurrence before a date as HijriDate
   */
  beforeHijri(dt: Date | HijriDateLike, inc: boolean = false): HijriDate | null {
    const dtHijri = this.toHijriDate(dt);
    const all = this.allHijri();

    let last: HijriDate | null = null;

    for (const date of all) {
      if (inc ? date.isOnOrBefore(dtHijri) : date.isBefore(dtHijri)) {
        last = date;
      } else {
        break;
      }
    }

    return last;
  }

  /**
   * Get string representation of all rules
   */
  valueOf(): string[] {
    const result: string[] = [];

    for (const rule of this._rrules) {
      result.push(rule.toString());
    }

    for (const date of this._rdates) {
      result.push(`RDATE;CALENDAR=HIJRI:${date.toRRuleString()}`);
    }

    for (const rule of this._exrules) {
      result.push(rule.toString().replace('RRULE:', 'EXRULE:'));
    }

    for (const date of this._exdates) {
      result.push(`EXDATE;CALENDAR=HIJRI:${date.toRRuleString()}`);
    }

    return result;
  }

  /**
   * Get single string representation
   */
  toString(): string {
    return this.valueOf().join('\n');
  }

  /**
   * Clone this rule set
   */
  clone(): HijriRRuleSet {
    const cloned = new HijriRRuleSet(this.cache === null);

    for (const rule of this._rrules) {
      cloned.rrule(rule.clone());
    }

    for (const date of this._rdates) {
      cloned.rdate(date.clone());
    }

    for (const rule of this._exrules) {
      cloned.exrule(rule.clone());
    }

    for (const date of this._exdates) {
      cloned.exdate(date.clone());
    }

    if (this._tzid) {
      cloned.tzid(this._tzid);
    }

    return cloned;
  }

  // Private methods

  /**
   * Generate all occurrences from rules and dates, minus exclusions
   */
  private generateOccurrences(): HijriDate[] {
    // Collect all inclusion dates
    const inclusions = new Map<string, HijriDate>();

    // Add RDATEs
    for (const date of this._rdates) {
      inclusions.set(date.toString(), date);
    }

    // Add dates from RRULEs
    for (const rule of this._rrules) {
      const dates = rule.allHijri();
      for (const date of dates) {
        inclusions.set(date.toString(), date);
      }
    }

    // Collect all exclusion dates
    const exclusions = new Set<string>();

    // Add EXDATEs
    for (const date of this._exdates) {
      exclusions.add(date.toString());
    }

    // Add dates from EXRULEs
    for (const rule of this._exrules) {
      const dates = rule.allHijri();
      for (const date of dates) {
        exclusions.add(date.toString());
      }
    }

    // Filter out exclusions and sort
    const result: HijriDate[] = [];
    for (const [key, date] of inclusions) {
      if (!exclusions.has(key)) {
        result.push(date);
      }
    }

    // Sort by date
    result.sort((a, b) => a.compare(b));

    return result;
  }

  /**
   * Convert Date or HijriDateLike to HijriDate
   */
  private toHijriDate(value: Date | HijriDateLike): HijriDate {
    if (value instanceof Date) {
      return gregorianToHijri(value);
    }
    if (value instanceof HijriDate) {
      return value;
    }
    return new HijriDate(value.year, value.month, value.day);
  }

  /**
   * Clear the cache
   */
  private clearCache(): void {
    this.cache?.clear();
  }
}
