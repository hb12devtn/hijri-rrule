import { RRuleStrOptions } from '../types/options';
import { HijriDate } from '../calendar/hijri-date';
import { gregorianToHijri } from '../calendar/hijri-converter';
import { HijriRRule } from './hijri-rrule';
import { HijriRRuleSet } from './hijri-rruleset';
import { parseString } from '../core/string-parser';

/**
 * Parse an RRULE string or set of strings into HijriRRule or HijriRRuleSet
 *
 * @param str - RRULE string (can be multi-line)
 * @param options - Parsing options
 * @returns HijriRRule or HijriRRuleSet
 *
 * @example
 * ```typescript
 * // Single rule
 * const rule = hijriRuleStr('FREQ=YEARLY;BYMONTH=9;BYMONTHDAY=1;COUNT=5');
 *
 * // With DTSTART
 * const rule = hijriRuleStr('DTSTART:14460901\nRRULE:FREQ=YEARLY;BYMONTH=9');
 *
 * // Force RRuleSet
 * const ruleSet = hijriRuleStr('FREQ=YEARLY;BYMONTH=9', { forceset: true });
 * ```
 */
export function hijriRuleStr(
  str: string,
  options: RRuleStrOptions & { forceset: true }
): HijriRRuleSet;
export function hijriRuleStr(
  str: string,
  options?: RRuleStrOptions
): HijriRRule | HijriRRuleSet;
export function hijriRuleStr(
  str: string,
  options: RRuleStrOptions = {}
): HijriRRule | HijriRRuleSet {
  const {
    cache = false,
    dtstart,
    unfold = false,
    forceset = false,
    // compatible option is reserved for future RFC 5545 compatibility mode
    tzid,
  } = options;

  // Unfold lines if requested
  let processedStr = str;
  if (unfold) {
    processedStr = unfoldLines(str);
  }

  // Parse the string to find components
  const lines = processedStr.split(/[\r\n]+/).filter((line) => line.trim());

  let parsedDtstart: HijriDate | undefined;
  const rruleLines: string[] = [];
  const rdateLines: string[] = [];
  const exruleLines: string[] = [];
  const exdateLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('DTSTART')) {
      parsedDtstart = parseDtstartLine(trimmed);
    } else if (trimmed.startsWith('RRULE:') || trimmed.includes('FREQ=')) {
      rruleLines.push(trimmed);
    } else if (trimmed.startsWith('RDATE')) {
      rdateLines.push(trimmed);
    } else if (trimmed.startsWith('EXRULE:')) {
      exruleLines.push(trimmed);
    } else if (trimmed.startsWith('EXDATE')) {
      exdateLines.push(trimmed);
    }
  }

  // Determine if we need an RRuleSet
  const needsSet =
    forceset ||
    rruleLines.length > 1 ||
    rdateLines.length > 0 ||
    exruleLines.length > 0 ||
    exdateLines.length > 0;

  // Use provided dtstart or parsed one
  let effectiveDtstart = parsedDtstart;
  if (dtstart) {
    if (dtstart instanceof Date) {
      effectiveDtstart = gregorianToHijri(dtstart);
    } else if (dtstart instanceof HijriDate) {
      effectiveDtstart = dtstart;
    } else {
      effectiveDtstart = new HijriDate(dtstart.year, dtstart.month, dtstart.day);
    }
  }

  if (needsSet) {
    const ruleSet = new HijriRRuleSet(!cache);

    // Add RRULEs
    for (const rruleLine of rruleLines) {
      const options = parseString(rruleLine);
      if (effectiveDtstart) {
        options.dtstart = effectiveDtstart;
      }
      if (tzid) {
        options.tzid = tzid;
      }
      ruleSet.rrule(new HijriRRule(options, !cache));
    }

    // Add RDATEs
    for (const rdateLine of rdateLines) {
      const date = parseRDateLine(rdateLine);
      if (date) {
        ruleSet.rdate(date);
      }
    }

    // Add EXRULEs
    for (const exruleLine of exruleLines) {
      const options = parseString(exruleLine.replace('EXRULE:', 'RRULE:'));
      if (effectiveDtstart) {
        options.dtstart = effectiveDtstart;
      }
      if (tzid) {
        options.tzid = tzid;
      }
      ruleSet.exrule(new HijriRRule(options, !cache));
    }

    // Add EXDATEs
    for (const exdateLine of exdateLines) {
      const date = parseExDateLine(exdateLine);
      if (date) {
        ruleSet.exdate(date);
      }
    }

    if (tzid) {
      ruleSet.tzid(tzid);
    }

    return ruleSet;
  } else {
    // Single rule
    const rruleLine = rruleLines[0] || str;
    const options = parseString(rruleLine);

    if (effectiveDtstart) {
      options.dtstart = effectiveDtstart;
    }
    if (tzid) {
      options.tzid = tzid;
    }

    return new HijriRRule(options, !cache);
  }
}

/**
 * Unfold lines per RFC 5545
 * Lines starting with whitespace are continuations
 */
function unfoldLines(str: string): string {
  return str.replace(/\r?\n[\t ]/g, '');
}

/**
 * Parse a DTSTART line
 */
function parseDtstartLine(line: string): HijriDate {
  const colonIndex = line.lastIndexOf(':');
  if (colonIndex === -1) {
    throw new Error(`Invalid DTSTART line: ${line}`);
  }

  const dateStr = line.substring(colonIndex + 1).trim().replace(/Z$/, '');
  return HijriDate.fromRRuleString(dateStr);
}

/**
 * Parse an RDATE line
 */
function parseRDateLine(line: string): HijriDate | null {
  try {
    const colonIndex = line.lastIndexOf(':');
    if (colonIndex === -1) return null;

    const dateStr = line.substring(colonIndex + 1).trim().replace(/Z$/, '');
    return HijriDate.fromRRuleString(dateStr);
  } catch {
    return null;
  }
}

/**
 * Parse an EXDATE line
 */
function parseExDateLine(line: string): HijriDate | null {
  return parseRDateLine(line);
}
