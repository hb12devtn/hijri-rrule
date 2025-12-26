import {
  FrequencyStr,
  HijriDateLike,
  HijriRRuleParsedOptions,
  HijriRRulePartialOptions,
  WeekdaySpec,
  WeekdayStr
} from '../types';
import {gregorianToHijri, HijriDate} from '../calendar';

/**
 * Helper to convert Date or HijriDateLike to HijriDate
 */
function toHijriDate(value: Date | HijriDateLike): HijriDate {
  if (value instanceof HijriDate) {
    return value;
  }
  if (value instanceof Date) {
    return gregorianToHijri(value);
  }
  return new HijriDate(value.year, value.month, value.day);
}

/**
 * Convert options to RRULE string
 *
 * @param options - Parsed or partial options
 * @param includeDtstart - Whether to include DTSTART line (default: true)
 * @returns RRULE string
 */
export function optionsToString(
  options: HijriRRuleParsedOptions | HijriRRulePartialOptions,
  includeDtstart: boolean = true
): string {
  const parts: string[] = [];

  // DTSTART line
  if (includeDtstart && options.dtstart) {
    const hijriDate = toHijriDate(options.dtstart);
    const calendarStr = options.calendar === 'islamic-tbla'
      ? 'HIJRI-TABULAR'
      : 'HIJRI-UM-AL-QURA';  // default
    parts.push(`DTSTART;CALENDAR=${calendarStr}:${hijriDate.toRRuleString()}`);
  }

  // Build RRULE properties
  const rruleParts: string[] = [];

  // FREQ (required)
  rruleParts.push(`FREQ=${FrequencyStr[options.freq]}`);

  // INTERVAL
  if (options.interval !== undefined && options.interval !== 1) {
    rruleParts.push(`INTERVAL=${options.interval}`);
  }

  // WKST
  if (options.wkst !== undefined) {
    rruleParts.push(`WKST=${WeekdayStr[options.wkst]}`);
  }

  // COUNT
  if (options.count !== undefined) {
    rruleParts.push(`COUNT=${options.count}`);
  }

  // UNTIL
  if (options.until) {
    const hijriUntil = toHijriDate(options.until);
    rruleParts.push(`UNTIL=${hijriUntil.toRRuleString()}`);
  }

  // BYSETPOS
  const bysetpos = (options as HijriRRuleParsedOptions).bysetpos;
  if (bysetpos && bysetpos.length > 0) {
    rruleParts.push(`BYSETPOS=${bysetpos.join(',')}`);
  }

  // BYMONTH
  const bymonth = (options as HijriRRuleParsedOptions).bymonth;
  if (bymonth && bymonth.length > 0) {
    rruleParts.push(`BYMONTH=${bymonth.join(',')}`);
  }

  // BYMONTHDAY (combine positive and negative)
  const bymonthday = (options as HijriRRuleParsedOptions).bymonthday || [];
  const bynmonthday = (options as HijriRRuleParsedOptions).bynmonthday || [];
  const allMonthDays = [...bymonthday, ...bynmonthday];
  if (allMonthDays.length > 0) {
    rruleParts.push(`BYMONTHDAY=${allMonthDays.join(',')}`);
  }

  // BYYEARDAY
  const byyearday = (options as HijriRRuleParsedOptions).byyearday;
  if (byyearday && byyearday.length > 0) {
    rruleParts.push(`BYYEARDAY=${byyearday.join(',')}`);
  }

  // BYWEEKNO
  const byweekno = (options as HijriRRuleParsedOptions).byweekno;
  if (byweekno && byweekno.length > 0) {
    rruleParts.push(`BYWEEKNO=${byweekno.join(',')}`);
  }

  // BYDAY (combine simple and nth weekdays)
  const byweekday = (options as HijriRRuleParsedOptions).byweekday || [];
  const bynweekday = (options as HijriRRuleParsedOptions).bynweekday || [];
  const allWeekdays = [...byweekday, ...bynweekday];
  if (allWeekdays.length > 0) {
    const dayStrs = allWeekdays.map(formatWeekdaySpec);
    rruleParts.push(`BYDAY=${dayStrs.join(',')}`);
  }

  // BYHOUR
  const byhour = (options as HijriRRuleParsedOptions).byhour;
  if (byhour && byhour.length > 0) {
    rruleParts.push(`BYHOUR=${byhour.join(',')}`);
  }

  // BYMINUTE
  const byminute = (options as HijriRRuleParsedOptions).byminute;
  if (byminute && byminute.length > 0) {
    rruleParts.push(`BYMINUTE=${byminute.join(',')}`);
  }

  // BYSECOND
  const bysecond = (options as HijriRRuleParsedOptions).bysecond;
  if (bysecond && bysecond.length > 0) {
    rruleParts.push(`BYSECOND=${bysecond.join(',')}`);
  }

  // TZID
  if (options.tzid) {
    rruleParts.push(`TZID=${options.tzid}`);
  }

  // SKIP (only if not default 'omit')
  const skip = (options as HijriRRuleParsedOptions).skip;
  if (skip && skip !== 'omit') {
    rruleParts.push(`SKIP=${skip.toUpperCase()}`);
  }

  parts.push(`RRULE:${rruleParts.join(';')}`);

  return parts.join('\n');
}

/**
 * Format a WeekdaySpec as string
 */
function formatWeekdaySpec(spec: WeekdaySpec): string {
  const dayStr = WeekdayStr[spec.weekday];
  if (spec.n !== undefined) {
    return `${spec.n}${dayStr}`;
  }
  return dayStr;
}

/**
 * Convert options to RRULE string without DTSTART
 */
export function rruleToString(options: HijriRRuleParsedOptions | HijriRRulePartialOptions): string {
  const fullStr = optionsToString(options, true);
  const lines = fullStr.split('\n');

  // Return only the RRULE line
  const rruleLine = lines.find((line) => line.startsWith('RRULE:'));
  return rruleLine || '';
}

/**
 * Get the RRULE property string only (without RRULE: prefix)
 */
export function getPropertiesString(options: HijriRRuleParsedOptions | HijriRRulePartialOptions): string {
  const rruleLine = rruleToString(options);
  return rruleLine.replace(/^RRULE:/, '');
}
