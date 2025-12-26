import {
  Frequency,
  HijriDateLike,
  HijriRRuleParsedOptions,
  HijriRRulePartialOptions,
  Skip,
  WeekdayNum,
  WeekdaySpec,
} from '../types';
import {gregorianToHijri, HijriDate} from '../calendar';
import {HijriWeekday} from '../weekday';
import {DEFAULT_WKST} from '../constants';
import {getCalendarConfig} from '../calendar/config';

/**
 * Normalize a value to an array
 */
function toArray<T>(value: T | T[] | undefined): T[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

/**
 * Normalize weekday input to WeekdaySpec array
 */
function normalizeWeekdays(
  value: WeekdayNum | WeekdaySpec | (WeekdayNum | WeekdaySpec)[] | undefined
): WeekdaySpec[] | undefined {
  if (value === undefined) return undefined;

  const values = Array.isArray(value) ? value : [value];

  return values.map((v) => {
    if (typeof v === 'number') {
      return { weekday: v as WeekdayNum };
    }
    if (v instanceof HijriWeekday) {
      return { weekday: v.weekday, n: v.n };
    }
    return v as WeekdaySpec;
  });
}

/**
 * Convert a Date or HijriDateLike to HijriDate
 */
function toHijriDate(value: Date | HijriDateLike): HijriDate {
  if (value instanceof Date) {
    return gregorianToHijri(value);
  }
  if (value instanceof HijriDate) {
    return value;
  }
  return new HijriDate(value.year, value.month, value.day);
}

/**
 * Separate positive and negative bymonthday values
 */
function separateMonthDays(days: number[] | undefined): {
  positive?: number[];
  negative?: number[];
} {
  if (!days) return {};

  const positive: number[] = [];
  const negative: number[] = [];

  for (const day of days) {
    if (day > 0) {
      positive.push(day);
    } else if (day < 0) {
      negative.push(day);
    }
  }

  return {
    positive: positive.length > 0 ? positive : undefined,
    negative: negative.length > 0 ? negative : undefined,
  };
}

/**
 * Separate weekdays with and without n (nth occurrence)
 */
function separateWeekdays(weekdays: WeekdaySpec[] | undefined): {
  simple?: WeekdaySpec[];
  nth?: WeekdaySpec[];
} {
  if (!weekdays) return {};

  const simple: WeekdaySpec[] = [];
  const nth: WeekdaySpec[] = [];

  for (const wd of weekdays) {
    if (wd.n !== undefined) {
      nth.push(wd);
    } else {
      simple.push(wd);
    }
  }

  return {
    simple: simple.length > 0 ? simple : undefined,
    nth: nth.length > 0 ? nth : undefined,
  };
}

/**
 * Validate options
 */
function validateOptions(options: HijriRRulePartialOptions): void {
  // Frequency is required
  if (options.freq === undefined) {
    throw new Error('freq is required');
  }

  if (
    options.freq < Frequency.YEARLY ||
    options.freq > Frequency.SECONDLY
  ) {
    throw new Error(`Invalid frequency: ${options.freq}`);
  }

  // Validate interval
  if (options.interval !== undefined) {
    if (!Number.isInteger(options.interval) || options.interval < 1) {
      throw new Error(`Invalid interval: ${options.interval}. Must be a positive integer.`);
    }
  }

  // Validate count
  if (options.count !== undefined) {
    if (!Number.isInteger(options.count) || options.count < 0) {
      throw new Error(`Invalid count: ${options.count}. Must be a non-negative integer.`);
    }
  }

  // Validate bymonth (1-12)
  const bymonth = toArray(options.bymonth);
  if (bymonth) {
    for (const m of bymonth) {
      if (!Number.isInteger(m) || m < 1 || m > 12) {
        throw new Error(`Invalid bymonth: ${m}. Must be between 1 and 12.`);
      }
    }
  }

  // Validate bymonthday (-30 to -1, 1 to 30)
  const bymonthday = toArray(options.bymonthday);
  if (bymonthday) {
    for (const d of bymonthday) {
      if (!Number.isInteger(d) || d === 0 || d < -30 || d > 30) {
        throw new Error(`Invalid bymonthday: ${d}. Must be between -30 and 30 (excluding 0).`);
      }
    }
  }

  // Validate byyearday (-355 to -1, 1 to 355)
  const byyearday = toArray(options.byyearday);
  if (byyearday) {
    for (const d of byyearday) {
      if (!Number.isInteger(d) || d === 0 || d < -355 || d > 355) {
        throw new Error(`Invalid byyearday: ${d}. Must be between -355 and 355 (excluding 0).`);
      }
    }
  }

  // Validate bysetpos
  const bysetpos = toArray(options.bysetpos);
  if (bysetpos) {
    for (const p of bysetpos) {
      if (!Number.isInteger(p) || p === 0 || p < -366 || p > 366) {
        throw new Error(`Invalid bysetpos: ${p}.`);
      }
    }
  }

  // Validate byhour (0-23)
  const byhour = toArray(options.byhour);
  if (byhour) {
    for (const h of byhour) {
      if (!Number.isInteger(h) || h < 0 || h > 23) {
        throw new Error(`Invalid byhour: ${h}. Must be between 0 and 23.`);
      }
    }
  }

  // Validate byminute (0-59)
  const byminute = toArray(options.byminute);
  if (byminute) {
    for (const m of byminute) {
      if (!Number.isInteger(m) || m < 0 || m > 59) {
        throw new Error(`Invalid byminute: ${m}. Must be between 0 and 59.`);
      }
    }
  }

  // Validate bysecond (0-59)
  const bysecond = toArray(options.bysecond);
  if (bysecond) {
    for (const s of bysecond) {
      if (!Number.isInteger(s) || s < 0 || s > 59) {
        throw new Error(`Invalid bysecond: ${s}. Must be between 0 and 59.`);
      }
    }
  }
}

/**
 * Parse and normalize options for HijriRRule
 *
 * @param options - Partial options from user
 * @returns Fully parsed and normalized options
 */
export function parseOptions(options: HijriRRulePartialOptions): HijriRRuleParsedOptions {
  // Validate first
  validateOptions(options);

  // Parse dtstart
  let dtstart: HijriDate;
  if (options.dtstart) {
    dtstart = toHijriDate(options.dtstart);
  } else {
    // Default to current date in Hijri
    dtstart = gregorianToHijri(new Date());
  }

  // Parse until
  let until: HijriDate | undefined;
  if (options.until) {
    until = toHijriDate(options.until);
  }

  // Separate bymonthday into positive and negative
  const monthDays = separateMonthDays(toArray(options.bymonthday));

  // Separate byweekday into simple and nth
  const weekdays = separateWeekdays(normalizeWeekdays(options.byweekday));

  return {
    freq: options.freq,
    dtstart,
    interval: options.interval ?? 1,
    wkst: options.wkst ?? DEFAULT_WKST,
    count: options.count,
    until,
    tzid: options.tzid,
    bysetpos: toArray(options.bysetpos),
    bymonth: toArray(options.bymonth),
    bymonthday: monthDays.positive,
    bynmonthday: monthDays.negative,
    byyearday: toArray(options.byyearday),
    byweekno: toArray(options.byweekno),
    byweekday: weekdays.simple,
    bynweekday: weekdays.nth,
    byhour: toArray(options.byhour),
    byminute: toArray(options.byminute),
    bysecond: toArray(options.bysecond),
    skip: options.skip ?? Skip.OMIT,
    calendar: options.calendar ?? getCalendarConfig().defaultCalendar,
  };
}

/**
 * Convert ParsedOptions back to PartialOptions
 * Useful for cloning rules
 */
export function optionsToPartial(parsed: HijriRRuleParsedOptions): HijriRRulePartialOptions {
  const partial: HijriRRulePartialOptions = {
    freq: parsed.freq,
    dtstart: parsed.dtstart,
    interval: parsed.interval,
    wkst: parsed.wkst,
  };

  if (parsed.count !== undefined) partial.count = parsed.count;
  if (parsed.until) partial.until = parsed.until;
  if (parsed.tzid) partial.tzid = parsed.tzid;
  if (parsed.bysetpos) partial.bysetpos = parsed.bysetpos;
  if (parsed.bymonth) partial.bymonth = parsed.bymonth;

  // Combine positive and negative monthdays
  if (parsed.bymonthday || parsed.bynmonthday) {
    partial.bymonthday = [
      ...(parsed.bymonthday || []),
      ...(parsed.bynmonthday || []),
    ];
  }

  if (parsed.byyearday) partial.byyearday = parsed.byyearday;
  if (parsed.byweekno) partial.byweekno = parsed.byweekno;

  // Combine simple and nth weekdays
  if (parsed.byweekday || parsed.bynweekday) {
    partial.byweekday = [
      ...(parsed.byweekday || []),
      ...(parsed.bynweekday || []),
    ];
  }

  if (parsed.byhour) partial.byhour = parsed.byhour;
  if (parsed.byminute) partial.byminute = parsed.byminute;
  if (parsed.bysecond) partial.bysecond = parsed.bysecond;
  if (parsed.skip) partial.skip = parsed.skip;
  if (parsed.calendar) partial.calendar = parsed.calendar;

  return partial;
}
