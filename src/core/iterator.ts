import { ParsedOptions, Skip } from '../types/options';
import { Frequency } from '../types/frequency';
import { HijriDate } from '../calendar/hijri-date';
import {
  addDays,
  addMonths,
  addYears,
  dayOfWeek,
  nthWeekdayOfMonth,
} from '../calendar/hijri-date-math';
import { getMonthLength, getYearLength } from '../calendar/hijri-calendar';
import { IslamicCalendarType } from '../calendar/types';

/**
 * Generate recurrence occurrences based on parsed options
 *
 * @param options - Parsed RRULE options
 * @yields HijriDate occurrences
 */
export function* iterate(options: ParsedOptions): Generator<HijriDate> {
  let count = 0;
  let current = HijriDate.from(options.dtstart);

  // Maximum iterations to prevent infinite loops
  const maxIterations = options.count ? options.count * 100 : 100000;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    // Generate candidates for this period
    const candidates = generateCandidates(current, options);

    // Apply bysetpos if specified
    const filtered = options.bysetpos
      ? applyBySetPos(candidates, options.bysetpos)
      : candidates;

    // Yield valid occurrences
    for (const candidate of filtered) {
      // Skip if before dtstart
      if (candidate.isBefore(options.dtstart)) {
        continue;
      }

      // Check if past UNTIL
      if (options.until && candidate.isAfter(options.until)) {
        return;
      }

      yield candidate;
      count++;

      // Check COUNT limit
      if (options.count !== undefined && count >= options.count) {
        return;
      }
    }

    // Advance to next period
    current = advancePeriod(current, options.freq, options.interval);

    // Safety check: if we've gone too far past UNTIL, stop
    if (options.until && current.isAfter(options.until)) {
      // Generate one more set of candidates to catch edge cases
      const lastCandidates = generateCandidates(current, options);
      for (const candidate of lastCandidates) {
        if (candidate.isOnOrBefore(options.until) && candidate.isOnOrAfter(options.dtstart)) {
          yield candidate;
          count++;
          if (options.count !== undefined && count >= options.count) {
            return;
          }
        }
      }
      return;
    }
  }
}

/**
 * Generate candidate dates for a period
 */
function generateCandidates(
  periodStart: HijriDate,
  options: ParsedOptions
): HijriDate[] {
  switch (options.freq) {
    case Frequency.YEARLY:
      return generateYearlyCandidates(periodStart, options);
    case Frequency.MONTHLY:
      return generateMonthlyCandidates(periodStart, options);
    case Frequency.WEEKLY:
      return generateWeeklyCandidates(periodStart, options);
    case Frequency.DAILY:
      return generateDailyCandidates(periodStart, options);
    default:
      // For higher frequencies, just return the current date
      return [periodStart];
  }
}

/**
 * Generate candidates for YEARLY frequency
 */
function generateYearlyCandidates(
  periodStart: HijriDate,
  options: ParsedOptions
): HijriDate[] {
  const year = periodStart.year;
  let candidates: HijriDate[] = [];

  // If BYMONTH is specified
  if (options.bymonth && options.bymonth.length > 0) {
    for (const month of options.bymonth) {
      // If BYMONTHDAY is specified
      if (options.bymonthday && options.bymonthday.length > 0) {
        for (const day of options.bymonthday) {
          const date = tryCreateDate(year, month, day, options.skip, options.calendar);
          if (date) candidates.push(date);
        }
      }
      // If negative BYMONTHDAY (e.g., -1 = last day)
      else if (options.bynmonthday && options.bynmonthday.length > 0) {
        for (const nday of options.bynmonthday) {
          const maxDay = getMonthLength(year, month, options.calendar);
          const day = maxDay + nday + 1; // -1 becomes maxDay, -2 becomes maxDay-1
          if (day >= 1) {
            candidates.push(new HijriDate(year, month, day));
          }
        }
      }
      // If BYDAY with nth weekday (e.g., 1FR = first Friday)
      else if (options.bynweekday && options.bynweekday.length > 0) {
        for (const wd of options.bynweekday) {
          if (wd.n !== undefined) {
            const date = nthWeekdayOfMonth(year, month, wd.weekday, wd.n);
            if (date) candidates.push(date);
          }
        }
      }
      // If simple BYDAY (e.g., MO, TU)
      else if (options.byweekday && options.byweekday.length > 0) {
        // Get all matching weekdays in the month
        const monthLength = getMonthLength(year, month, options.calendar);
        for (let d = 1; d <= monthLength; d++) {
          const date = new HijriDate(year, month, d);
          const dow = dayOfWeek(date);
          if (options.byweekday.some((wd) => wd.weekday === dow)) {
            candidates.push(date);
          }
        }
      }
      // Default: first day of month (like dtstart day)
      else {
        const day = Math.min(periodStart.day, getMonthLength(year, month, options.calendar));
        candidates.push(new HijriDate(year, month, day));
      }
    }
  }
  // If only BYMONTHDAY (without BYMONTH)
  else if (options.bymonthday && options.bymonthday.length > 0) {
    // Apply to dtstart month only
    const month = periodStart.month;
    for (const day of options.bymonthday) {
      const date = tryCreateDate(year, month, day, options.skip, options.calendar);
      if (date) candidates.push(date);
    }
  }
  // If BYYEARDAY
  else if (options.byyearday && options.byyearday.length > 0) {
    const yearLength = getYearLength(year, options.calendar);
    for (const yday of options.byyearday) {
      const actualDay = yday > 0 ? yday : yearLength + yday + 1;
      if (actualDay >= 1 && actualDay <= yearLength) {
        const date = dayOfYearToDate(year, actualDay, options.calendar);
        if (date) candidates.push(date);
      }
    }
  }
  // Default: same day as dtstart
  else {
    const day = Math.min(periodStart.day, getMonthLength(year, periodStart.month, options.calendar));
    candidates.push(new HijriDate(year, periodStart.month, day));
  }

  // Apply BYDAY filter if specified without nth
  if (options.byweekday && options.byweekday.length > 0 && !options.bymonth) {
    candidates = candidates.filter((c) => {
      const dow = dayOfWeek(c);
      return options.byweekday!.some((wd) => wd.weekday === dow);
    });
  }

  // Sort and deduplicate
  return sortAndDedupe(candidates);
}

/**
 * Generate candidates for MONTHLY frequency
 */
function generateMonthlyCandidates(
  periodStart: HijriDate,
  options: ParsedOptions
): HijriDate[] {
  const year = periodStart.year;
  const month = periodStart.month;
  const candidates: HijriDate[] = [];

  // If BYMONTHDAY
  if (options.bymonthday && options.bymonthday.length > 0) {
    for (const day of options.bymonthday) {
      const date = tryCreateDate(year, month, day, options.skip, options.calendar);
      if (date) candidates.push(date);
    }
  }
  // If negative BYMONTHDAY
  else if (options.bynmonthday && options.bynmonthday.length > 0) {
    const maxDay = getMonthLength(year, month, options.calendar);
    for (const nday of options.bynmonthday) {
      const day = maxDay + nday + 1;
      if (day >= 1) {
        candidates.push(new HijriDate(year, month, day));
      }
    }
  }
  // If BYDAY with nth
  else if (options.bynweekday && options.bynweekday.length > 0) {
    for (const wd of options.bynweekday) {
      if (wd.n !== undefined) {
        const date = nthWeekdayOfMonth(year, month, wd.weekday, wd.n);
        if (date) candidates.push(date);
      }
    }
  }
  // If simple BYDAY
  else if (options.byweekday && options.byweekday.length > 0) {
    const monthLength = getMonthLength(year, month, options.calendar);
    for (let d = 1; d <= monthLength; d++) {
      const date = new HijriDate(year, month, d);
      const dow = dayOfWeek(date);
      if (options.byweekday.some((wd) => wd.weekday === dow)) {
        candidates.push(date);
      }
    }
  }
  // Default: same day as dtstart
  else {
    const day = Math.min(periodStart.day, getMonthLength(year, month, options.calendar));
    candidates.push(new HijriDate(year, month, day));
  }

  return sortAndDedupe(candidates);
}

/**
 * Generate candidates for WEEKLY frequency
 */
function generateWeeklyCandidates(
  periodStart: HijriDate,
  options: ParsedOptions
): HijriDate[] {
  const candidates: HijriDate[] = [];

  // If BYDAY is specified
  if (options.byweekday && options.byweekday.length > 0) {
    // Find all matching days in this week
    for (let i = 0; i < 7; i++) {
      const date = addDays(periodStart, i);
      const dow = dayOfWeek(date);
      if (options.byweekday.some((wd) => wd.weekday === dow)) {
        candidates.push(date);
      }
    }
  } else {
    // Default: same weekday as dtstart
    candidates.push(periodStart);
  }

  return sortAndDedupe(candidates);
}

/**
 * Generate candidates for DAILY frequency
 */
function generateDailyCandidates(
  periodStart: HijriDate,
  options: ParsedOptions
): HijriDate[] {
  // For daily, the candidate is just the current day
  const candidate = periodStart;

  // Apply BYMONTH filter
  if (options.bymonth && options.bymonth.length > 0) {
    if (!options.bymonth.includes(candidate.month)) {
      return [];
    }
  }

  // Apply BYMONTHDAY filter
  if (options.bymonthday && options.bymonthday.length > 0) {
    if (!options.bymonthday.includes(candidate.day)) {
      return [];
    }
  }

  // Apply BYDAY filter
  if (options.byweekday && options.byweekday.length > 0) {
    const dow = dayOfWeek(candidate);
    if (!options.byweekday.some((wd) => wd.weekday === dow)) {
      return [];
    }
  }

  return [candidate];
}

/**
 * Advance to the next period based on frequency
 */
function advancePeriod(
  current: HijriDate,
  freq: Frequency,
  interval: number
): HijriDate {
  switch (freq) {
    case Frequency.YEARLY:
      return addYears(current, interval) || addYears(current, interval, true)!;
    case Frequency.MONTHLY:
      return addMonths(current, interval) || addMonths(current, interval, true)!;
    case Frequency.WEEKLY:
      return addDays(current, interval * 7);
    case Frequency.DAILY:
      return addDays(current, interval);
    default:
      return addDays(current, 1);
  }
}

/**
 * Apply BYSETPOS filter to candidates
 */
function applyBySetPos(
  candidates: HijriDate[],
  positions: number[]
): HijriDate[] {
  const result: HijriDate[] = [];
  const len = candidates.length;

  for (const pos of positions) {
    let index: number;
    if (pos > 0) {
      index = pos - 1; // 1-based to 0-based
    } else {
      index = len + pos; // Negative index from end
    }

    if (index >= 0 && index < len) {
      result.push(candidates[index]);
    }
  }

  return sortAndDedupe(result);
}

/**
 * Try to create a HijriDate, handling invalid day numbers
 * Returns null if day doesn't exist and strategy is OMIT
 */
function tryCreateDate(
  year: number,
  month: number,
  day: number,
  strategy: Skip = Skip.OMIT,
  calendar?: IslamicCalendarType
): HijriDate | null {
  const maxDay = getMonthLength(year, month, calendar);

  if (day < 1) {
    return null;
  }

  if (day > maxDay) {
    switch (strategy) {
      case Skip.OMIT:
        return null;
      case Skip.BACKWARD:
        // Move backward to last valid day of the month
        return new HijriDate(year, month, maxDay);
      case Skip.FORWARD:
        // Move forward to 1st of next month
        if (month === 12) {
          return new HijriDate(year + 1, 1, 1);
        }
        return new HijriDate(year, month + 1, 1);
    }
  }

  try {
    return new HijriDate(year, month, day);
  } catch {
    return null;
  }
}

/**
 * Convert day of year to HijriDate
 */
function dayOfYearToDate(year: number, dayOfYear: number, calendar?: IslamicCalendarType): HijriDate | null {
  try {
    let remainingDays = dayOfYear;
    for (let month = 1; month <= 12; month++) {
      const monthLength = getMonthLength(year, month, calendar);
      if (remainingDays <= monthLength) {
        return new HijriDate(year, month, remainingDays);
      }
      remainingDays -= monthLength;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sort dates and remove duplicates
 */
function sortAndDedupe(dates: HijriDate[]): HijriDate[] {
  // Sort by date
  dates.sort((a, b) => a.compare(b));

  // Remove duplicates
  const result: HijriDate[] = [];
  for (const date of dates) {
    if (result.length === 0 || !result[result.length - 1].equals(date)) {
      result.push(date);
    }
  }

  return result;
}

/**
 * Get all occurrences up to a limit
 */
export function getAll(
  options: ParsedOptions,
  limit: number = 1000
): HijriDate[] {
  const result: HijriDate[] = [];
  let count = 0;

  for (const date of iterate(options)) {
    result.push(date);
    count++;
    if (count >= limit) break;
  }

  return result;
}

/**
 * Get occurrences between two dates
 */
export function getBetween(
  options: ParsedOptions,
  after: HijriDate,
  before: HijriDate,
  inclusive: boolean = false
): HijriDate[] {
  const result: HijriDate[] = [];

  for (const date of iterate(options)) {
    // Stop if past 'before' date
    if (inclusive ? date.isAfter(before) : date.isOnOrAfter(before)) {
      if (!date.equals(before)) break;
    }

    // Include if after 'after' date
    const isAfterStart = inclusive
      ? date.isOnOrAfter(after)
      : date.isAfter(after);

    if (isAfterStart) {
      const isBeforeEnd = inclusive
        ? date.isOnOrBefore(before)
        : date.isBefore(before);

      if (isBeforeEnd) {
        result.push(date);
      }
    }
  }

  return result;
}

/**
 * Get first occurrence after a date
 */
export function getAfter(
  options: ParsedOptions,
  dt: HijriDate,
  inclusive: boolean = false
): HijriDate | null {
  for (const date of iterate(options)) {
    if (inclusive ? date.isOnOrAfter(dt) : date.isAfter(dt)) {
      return date;
    }
  }
  return null;
}

/**
 * Get last occurrence before a date
 */
export function getBefore(
  options: ParsedOptions,
  dt: HijriDate,
  inclusive: boolean = false
): HijriDate | null {
  let last: HijriDate | null = null;

  for (const date of iterate(options)) {
    if (inclusive ? date.isOnOrBefore(dt) : date.isBefore(dt)) {
      last = date;
    } else {
      break;
    }
  }

  return last;
}
