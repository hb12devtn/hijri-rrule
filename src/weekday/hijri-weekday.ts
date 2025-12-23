import { WeekdayNum, WeekdayStr, WeekdaySpec } from '../types/weekday';
import { WEEKDAY_NAMES_EN, WEEKDAY_NAMES_AR } from '../constants/weekday';

/**
 * Represents a weekday with optional nth occurrence
 * Used for rules like "first Friday" or "last Monday"
 */
export class HijriWeekday implements WeekdaySpec {
  /** The weekday (0=Saturday, 1=Sunday, ..., 6=Friday) */
  public readonly weekday: WeekdayNum;

  /** Optional nth occurrence (1=first, 2=second, -1=last, -2=second last) */
  public readonly n?: number;

  /**
   * Create a new HijriWeekday
   *
   * @param weekday - The weekday number (0-6)
   * @param n - Optional nth occurrence
   */
  constructor(weekday: WeekdayNum, n?: number) {
    if (weekday < 0 || weekday > 6) {
      throw new Error(`Invalid weekday: ${weekday}. Must be between 0 and 6.`);
    }

    if (n !== undefined && (n === 0 || !Number.isInteger(n))) {
      throw new Error(`Invalid n: ${n}. Must be a non-zero integer.`);
    }

    this.weekday = weekday;
    this.n = n;
  }

  /**
   * Create a new HijriWeekday with nth occurrence
   * Chainable method for fluent API
   *
   * @example
   * HijriWeekday.FR.nth(1)  // First Friday
   * HijriWeekday.MO.nth(-1) // Last Monday
   */
  nth(n: number): HijriWeekday {
    return new HijriWeekday(this.weekday, n);
  }

  /**
   * Check if this weekday equals another
   */
  equals(other: HijriWeekday | WeekdaySpec): boolean {
    return this.weekday === other.weekday && this.n === other.n;
  }

  /**
   * Get string representation for RRULE (e.g., "MO", "1FR", "-1TH")
   */
  toString(): string {
    const dayStr = WeekdayStr[this.weekday];
    if (this.n !== undefined) {
      return `${this.n}${dayStr}`;
    }
    return dayStr;
  }

  /**
   * Get human-readable string in English
   */
  toText(locale: 'en' | 'ar' = 'en'): string {
    const names = locale === 'ar' ? WEEKDAY_NAMES_AR : WEEKDAY_NAMES_EN;
    const dayName = names[this.weekday];

    if (this.n === undefined) {
      return dayName;
    }

    if (locale === 'ar') {
      return `${dayName} ${this.getOrdinalAr(this.n)}`;
    }

    const ordinal = this.getOrdinalEn(this.n);
    return `the ${ordinal} ${dayName}`;
  }

  /**
   * Get ordinal string in English (e.g., "first", "second", "last")
   */
  private getOrdinalEn(n: number): string {
    if (n === -1) return 'last';
    if (n === -2) return 'second last';
    if (n === -3) return 'third last';

    const ordinals: Record<number, string> = {
      1: 'first',
      2: 'second',
      3: 'third',
      4: 'fourth',
      5: 'fifth',
    };

    return ordinals[n] || `${n}th`;
  }

  /**
   * Get ordinal string in Arabic
   */
  private getOrdinalAr(n: number): string {
    if (n === -1) return 'الأخير';
    if (n === -2) return 'قبل الأخير';

    const ordinals: Record<number, string> = {
      1: 'الأول',
      2: 'الثاني',
      3: 'الثالث',
      4: 'الرابع',
      5: 'الخامس',
    };

    return ordinals[n] || `${n}`;
  }

  /**
   * Parse a weekday string like "MO", "1FR", "-1TH"
   */
  static fromString(str: string): HijriWeekday {
    const pattern = /^(-?\d+)?([A-Z]{2})$/i;
    const match = str.toUpperCase().match(pattern);

    if (!match) {
      throw new Error(`Invalid weekday string: ${str}`);
    }

    const [, nStr, dayStr] = match;
    const n = nStr ? parseInt(nStr, 10) : undefined;

    const weekdayMap: Record<string, WeekdayNum> = {
      SA: WeekdayNum.SA,
      SU: WeekdayNum.SU,
      MO: WeekdayNum.MO,
      TU: WeekdayNum.TU,
      WE: WeekdayNum.WE,
      TH: WeekdayNum.TH,
      FR: WeekdayNum.FR,
    };

    const weekday = weekdayMap[dayStr];
    if (weekday === undefined) {
      throw new Error(`Invalid weekday: ${dayStr}`);
    }

    return new HijriWeekday(weekday, n);
  }

  /**
   * Get the weekday value for use in comparisons
   */
  valueOf(): number {
    return this.weekday;
  }

  /**
   * Get JSON representation
   */
  toJSON(): WeekdaySpec {
    const result: WeekdaySpec = { weekday: this.weekday };
    if (this.n !== undefined) {
      result.n = this.n;
    }
    return result;
  }

  // Static weekday constants for convenient access
  static readonly SA = new HijriWeekday(WeekdayNum.SA);
  static readonly SU = new HijriWeekday(WeekdayNum.SU);
  static readonly MO = new HijriWeekday(WeekdayNum.MO);
  static readonly TU = new HijriWeekday(WeekdayNum.TU);
  static readonly WE = new HijriWeekday(WeekdayNum.WE);
  static readonly TH = new HijriWeekday(WeekdayNum.TH);
  static readonly FR = new HijriWeekday(WeekdayNum.FR);
}

// Export convenience weekday constants
export const SA = HijriWeekday.SA;
export const SU = HijriWeekday.SU;
export const MO = HijriWeekday.MO;
export const TU = HijriWeekday.TU;
export const WE = HijriWeekday.WE;
export const TH = HijriWeekday.TH;
export const FR = HijriWeekday.FR;
