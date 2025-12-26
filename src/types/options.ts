import { Frequency } from './frequency';
import { WeekdayNum, WeekdaySpec } from './weekday';
import { IslamicCalendarType } from '../calendar/types';

/**
 * Forward declaration for HijriDate to avoid circular dependency
 */
export interface HijriDateLike {
  year: number;
  month: number;
  day: number;
  toGregorian(): Date;
}

/**
 * Options that can be passed to HijriRRule constructor
 * Partial options - not all fields are required
 */
export interface HijriRRulePartialOptions {
  /** Recurrence frequency (required) */
  freq: Frequency;

  /** Start date of the recurrence in Hijri calendar */
  dtstart?: HijriDateLike | Date;

  /** Interval between each freq iteration (default: 1) */
  interval?: number;

  /** Week start day (default: Sunday for Islamic convention) */
  wkst?: WeekdayNum;

  /** Total number of occurrences to generate */
  count?: number;

  /** End date limit for recurrence */
  until?: HijriDateLike | Date;

  /** Timezone identifier (IANA format) */
  tzid?: string;

  /** Position within the frequency period */
  bysetpos?: number | number[];

  /** Months to apply recurrence (1-12, where 1=Muharram, 9=Ramadan, 12=Dhu al-Hijjah) */
  bymonth?: number | number[];

  /** Days of month to apply recurrence (1-30) */
  bymonthday?: number | number[];

  /** Days of year to apply recurrence (1-355) */
  byyearday?: number | number[];

  /** Week numbers to apply recurrence */
  byweekno?: number | number[];

  /** Weekdays to apply recurrence */
  byweekday?: WeekdayNum | WeekdaySpec | (WeekdayNum | WeekdaySpec)[];

  /** Hours to apply recurrence (0-23) */
  byhour?: number | number[];

  /** Minutes to apply recurrence (0-59) */
  byminute?: number | number[];

  /** Seconds to apply recurrence (0-59) */
  bysecond?: number | number[];

  /** Strategy for handling invalid days (default: omit) */
  skip?: Skip;

  /**
   * Islamic calendar type to use for calculations
   * - 'islamic-umalqura': Saudi official calendar (default)
   * - 'islamic-tbla': Tabular Islamic Calendar
   */
  calendar?: IslamicCalendarType;
}

/**
 * Fully parsed and normalized options
 * All arrays are normalized, defaults are applied
 */
export interface HijriRRuleParsedOptions {
  /** Recurrence frequency */
  freq: Frequency;

  /** Start date of the recurrence (HijriDate) */
  dtstart: HijriDateLike;

  /** Interval between each freq iteration */
  interval: number;

  /** Week start day */
  wkst: WeekdayNum;

  /** Total number of occurrences to generate */
  count?: number;

  /** End date limit for recurrence */
  until?: HijriDateLike;

  /** Timezone identifier */
  tzid?: string;

  /** Position within the frequency period (always array) */
  bysetpos?: number[];

  /** Months to apply recurrence (always array) */
  bymonth?: number[];

  /** Days of month to apply recurrence (always array) */
  bymonthday?: number[];

  /** Negative days of month (e.g., -1 = last day) */
  bynmonthday?: number[];

  /** Days of year to apply recurrence (always array) */
  byyearday?: number[];

  /** Week numbers to apply recurrence (always array) */
  byweekno?: number[];

  /** Weekdays to apply recurrence (always array of WeekdaySpec) */
  byweekday?: WeekdaySpec[];

  /** Nth weekdays (weekdays with n specified) */
  bynweekday?: WeekdaySpec[];

  /** Hours to apply recurrence (always array) */
  byhour?: number[];

  /** Minutes to apply recurrence (always array) */
  byminute?: number[];

  /** Seconds to apply recurrence (always array) */
  bysecond?: number[];

  /** Strategy for handling invalid days (default: omit) */
  skip: Skip;

  /**
   * Islamic calendar type used for calculations
   */
  calendar: IslamicCalendarType;
}

/**
 * Strategy for handling days that don't exist in a month
 * e.g., day 30 in a 29-day month
 */
export enum Skip {
  /** Omit/skip the occurrence (default) */
  OMIT = 'omit',
  /** Move forward to next valid day (1st of next month) */
  FORWARD = 'forward',
  /** Move backward to last valid day of the month */
  BACKWARD = 'backward',
}

/**
 * Options for rrulestr parser
 */
export interface RRuleStrOptions {
  /** Enable caching */
  cache?: boolean;

  /** Default dtstart if not in string */
  dtstart?: HijriDateLike | Date;

  /** Unfold lines per RFC */
  unfold?: boolean;

  /** Force return of RRuleSet even for single rule */
  forceset?: boolean;

  /** RFC-compatible mode */
  compatible?: boolean;

  /** Default timezone if not in string */
  tzid?: string;
}
