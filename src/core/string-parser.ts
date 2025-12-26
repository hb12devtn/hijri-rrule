import {Frequency, HijriRRulePartialOptions, Skip, StrToFrequency, StrToWeekday, WeekdaySpec} from '../types';
import {HijriDate} from '../calendar';
import {IslamicCalendarType} from '../calendar/types';

/**
 * Parse an RRULE string into options
 *
 * Supports formats:
 * - "FREQ=YEARLY;BYMONTH=9;BYMONTHDAY=1"
 * - "RRULE:FREQ=YEARLY;BYMONTH=9"
 * - "DTSTART:14460901\nRRULE:FREQ=YEARLY"
 *
 * @param str - RRULE string to parse
 * @returns Partial options object
 */
export function parseString(str: string): HijriRRulePartialOptions {
  const lines = str.split(/[\r\n]+/).filter((line) => line.trim());

  let dtstart: HijriDate | undefined;
  let calendar: IslamicCalendarType | undefined;
  let rruleStr = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('DTSTART')) {
      const result = parseDtstart(trimmed);
      dtstart = result.date;
      calendar = result.calendar;
    } else if (trimmed.startsWith('RRULE:')) {
      rruleStr = trimmed.substring(6);
    } else if (trimmed.includes('FREQ=')) {
      // Bare RRULE without prefix
      rruleStr = trimmed;
    }
  }

  if (!rruleStr) {
    throw new Error('No RRULE found in string');
  }

  const options = parseRRuleProperties(rruleStr);

  if (dtstart) {
    options.dtstart = dtstart;
  }

  if (calendar) {
    options.calendar = calendar;
  }

  return options;
}

/**
 * Parse DTSTART line
 *
 * Formats:
 * - DTSTART:14460901
 * - DTSTART:14460901T120000
 * - DTSTART;CALENDAR=HIJRI:14460901
 * - DTSTART;CALENDAR=HIJRI-UM-AL-QURA:14460901
 * - DTSTART;CALENDAR=HIJRI-TABULAR:14460901
 * - DTSTART;TZID=Asia/Riyadh:14460901T120000
 */
function parseDtstart(line: string): { date: HijriDate; calendar?: IslamicCalendarType } {
  // Extract calendar type from CALENDAR parameter
  let calendar: IslamicCalendarType | undefined;

  if (line.includes('HIJRI-UM-AL-QURA')) {
    calendar = 'islamic-umalqura';
  } else if (line.includes('HIJRI-TABULAR')) {
    calendar = 'islamic-tbla';
  }
  // Note: plain "CALENDAR=HIJRI" defaults to undefined (uses global config)

  // Extract the date value after the last colon
  const colonIndex = line.lastIndexOf(':');
  if (colonIndex === -1) {
    throw new Error(`Invalid DTSTART line: ${line}`);
  }

  const dateStr = line.substring(colonIndex + 1).trim();

  // Remove trailing Z if present (we ignore timezone for now)
  const cleanStr = dateStr.replace(/Z$/, '');

  return { date: HijriDate.fromRRuleString(cleanStr), calendar };
}

/**
 * Parse RRULE properties string
 *
 * @param str - The properties string like "FREQ=YEARLY;BYMONTH=9;COUNT=5"
 * @returns Partial options object
 */
function parseRRuleProperties(str: string): HijriRRulePartialOptions {
  const options: HijriRRulePartialOptions = {} as HijriRRulePartialOptions;

  const parts = str.split(';').filter((p) => p.trim());

  for (const part of parts) {
    const [key, value] = part.split('=');

    if (!key || value === undefined) {
      continue; // Skip invalid parts
    }

    switch (key.toUpperCase()) {
      case 'FREQ':
        options.freq = parseFreq(value);
        break;

      case 'INTERVAL':
        options.interval = parseInt(value, 10);
        break;

      case 'COUNT':
        options.count = parseInt(value, 10);
        break;

      case 'UNTIL':
        options.until = parseUntil(value);
        break;

      case 'WKST':
        options.wkst = parseWkst(value);
        break;

      case 'BYSETPOS':
        options.bysetpos = parseIntList(value);
        break;

      case 'BYMONTH':
        options.bymonth = parseIntList(value);
        break;

      case 'BYMONTHDAY':
        options.bymonthday = parseIntList(value);
        break;

      case 'BYYEARDAY':
        options.byyearday = parseIntList(value);
        break;

      case 'BYWEEKNO':
        options.byweekno = parseIntList(value);
        break;

      case 'BYDAY':
      case 'BYWEEKDAY':
        options.byweekday = parseByDay(value);
        break;

      case 'BYHOUR':
        options.byhour = parseIntList(value);
        break;

      case 'BYMINUTE':
        options.byminute = parseIntList(value);
        break;

      case 'BYSECOND':
        options.bysecond = parseIntList(value);
        break;

      case 'TZID':
        options.tzid = value;
        break;

      case 'SKIP': {
        const skipValue = value.toLowerCase();
        if (skipValue === 'omit') options.skip = Skip.OMIT;
        else if (skipValue === 'forward') options.skip = Skip.FORWARD;
        else if (skipValue === 'backward') options.skip = Skip.BACKWARD;
        break;
      }
    }
  }

  if (options.freq === undefined) {
    throw new Error('FREQ is required in RRULE');
  }

  return options;
}

/**
 * Parse frequency value
 */
function parseFreq(value: string): Frequency {
  const freq = StrToFrequency[value.toUpperCase()];
  if (freq === undefined) {
    throw new Error(`Invalid FREQ value: ${value}`);
  }
  return freq;
}

/**
 * Parse UNTIL value
 */
function parseUntil(value: string): HijriDate {
  // Remove trailing Z if present
  const cleanValue = value.replace(/Z$/, '');
  return HijriDate.fromRRuleString(cleanValue);
}

/**
 * Parse WKST value
 */
function parseWkst(value: string): number {
  const wkst = StrToWeekday[value.toUpperCase()];
  if (wkst === undefined) {
    throw new Error(`Invalid WKST value: ${value}`);
  }
  return wkst;
}

/**
 * Parse comma-separated integer list
 */
function parseIntList(value: string): number[] {
  return value.split(',').map((v) => {
    const num = parseInt(v.trim(), 10);
    if (isNaN(num)) {
      throw new Error(`Invalid integer in list: ${v}`);
    }
    return num;
  });
}

/**
 * Parse BYDAY value
 *
 * Formats:
 * - "MO,TU,WE" - Simple weekdays
 * - "1MO" - First Monday
 * - "-1FR" - Last Friday
 * - "1MO,2TU,-1FR" - Mixed
 */
function parseByDay(value: string): WeekdaySpec[] {
  const parts = value.split(',').map((p) => p.trim());
  const result: WeekdaySpec[] = [];

  for (const part of parts) {
    const match = part.match(/^(-?\d+)?([A-Z]{2})$/i);
    if (!match) {
      throw new Error(`Invalid BYDAY value: ${part}`);
    }

    const [, nStr, dayStr] = match;
    const weekday = StrToWeekday[dayStr.toUpperCase()];

    if (weekday === undefined) {
      throw new Error(`Invalid weekday: ${dayStr}`);
    }

    const spec: WeekdaySpec = { weekday };
    if (nStr) {
      spec.n = parseInt(nStr, 10);
    }

    result.push(spec);
  }

  return result;
}

/**
 * Try to parse a string as either an RRULE or just the properties
 * Returns null if parsing fails
 */
export function tryParseString(str: string): HijriRRulePartialOptions | null {
  try {
    return parseString(str);
  } catch {
    return null;
  }
}
