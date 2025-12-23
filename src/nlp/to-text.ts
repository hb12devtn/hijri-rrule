import { ParsedOptions } from '../types/options';
import { Frequency } from '../types/frequency';
import { WeekdaySpec } from '../types/weekday';
import { getI18n, I18nStrings } from './i18n';
import { formatOrdinal } from '../constants/months';

/**
 * Convert parsed options to human-readable text
 *
 * @param options - Parsed RRULE options
 * @param locale - Language locale ('en' or 'ar')
 * @returns Human-readable text description
 *
 * @example
 * ```typescript
 * const text = toText(options, 'en');
 * // "every year on the 1st of Ramadan"
 *
 * const textAr = toText(options, 'ar');
 * // "كل سنة في ١ رمضان"
 * ```
 */
export function toText(options: ParsedOptions, locale: 'en' | 'ar' = 'en'): string {
  const i18n = getI18n(locale);
  const parts: string[] = [];

  // Build frequency phrase
  parts.push(buildFrequencyPhrase(options, i18n, locale));

  // Add month if specified
  if (options.bymonth && options.bymonth.length > 0) {
    parts.push(buildMonthPhrase(options.bymonth, i18n, locale));
  }

  // Add day of month if specified
  if (options.bymonthday && options.bymonthday.length > 0) {
    parts.push(buildMonthDayPhrase(options.bymonthday, i18n, locale));
  }

  // Add weekday if specified
  if (options.byweekday && options.byweekday.length > 0) {
    parts.push(buildWeekdayPhrase(options.byweekday, i18n, locale));
  }

  // Add nth weekday if specified
  if (options.bynweekday && options.bynweekday.length > 0) {
    parts.push(buildNthWeekdayPhrase(options.bynweekday, i18n, locale));
  }

  // Add count if specified
  if (options.count !== undefined) {
    parts.push(buildCountPhrase(options.count, i18n, locale));
  }

  // Add until if specified
  if (options.until) {
    parts.push(buildUntilPhrase(options.until, i18n, locale));
  }

  // Join parts based on locale
  if (locale === 'ar') {
    return parts.join(' ');
  }

  return parts.join(' ');
}

/**
 * Build frequency phrase
 */
function buildFrequencyPhrase(
  options: ParsedOptions,
  i18n: I18nStrings,
  locale: 'en' | 'ar'
): string {
  const interval = options.interval;

  const freqWords: Record<Frequency, { singular: string; plural: string }> = {
    [Frequency.YEARLY]: { singular: i18n.year, plural: i18n.years },
    [Frequency.MONTHLY]: { singular: i18n.month, plural: i18n.months },
    [Frequency.WEEKLY]: { singular: i18n.week, plural: i18n.weeks },
    [Frequency.DAILY]: { singular: i18n.day, plural: i18n.days },
    [Frequency.HOURLY]: { singular: i18n.hourly, plural: i18n.hourly },
    [Frequency.MINUTELY]: { singular: i18n.minutely, plural: i18n.minutely },
    [Frequency.SECONDLY]: { singular: i18n.secondly, plural: i18n.secondly },
  };

  const { singular, plural } = freqWords[options.freq];

  if (locale === 'ar') {
    if (interval === 1) {
      return `${i18n.every} ${singular}`;
    } else if (interval === 2) {
      return `${i18n.every} ${singular}ين`; // dual form
    } else {
      return `${i18n.every} ${interval} ${plural}`;
    }
  } else {
    if (interval === 1) {
      return `${i18n.every} ${singular}`;
    } else {
      return `${i18n.every} ${interval} ${plural}`;
    }
  }
}

/**
 * Build month phrase
 */
function buildMonthPhrase(
  months: number[],
  i18n: I18nStrings,
  locale: 'en' | 'ar'
): string {
  const monthNames = months.map((m) => i18n.monthNames[m]);

  if (locale === 'ar') {
    if (monthNames.length === 1) {
      return `${i18n.in} ${monthNames[0]}`;
    }
    return `${i18n.in} ${monthNames.slice(0, -1).join('، ')} ${i18n.and} ${monthNames[monthNames.length - 1]}`;
  } else {
    if (monthNames.length === 1) {
      return `${i18n.in} ${monthNames[0]}`;
    }
    return `${i18n.in} ${monthNames.slice(0, -1).join(', ')} ${i18n.and} ${monthNames[monthNames.length - 1]}`;
  }
}

/**
 * Build month day phrase
 */
function buildMonthDayPhrase(
  days: number[],
  i18n: I18nStrings,
  locale: 'en' | 'ar'
): string {
  if (locale === 'ar') {
    const dayStrs = days.map((d) => String(d));
    if (dayStrs.length === 1) {
      return `${i18n.on} ${i18n.dayPrefix} ${dayStrs[0]}`;
    }
    return `${i18n.on} ${i18n.dayPrefix} ${dayStrs.slice(0, -1).join('، ')} ${i18n.and} ${dayStrs[dayStrs.length - 1]}`;
  } else {
    const dayStrs = days.map((d) => `${i18n.the} ${formatOrdinal(d)}`);
    if (dayStrs.length === 1) {
      return `${i18n.on} ${dayStrs[0]}`;
    }
    return `${i18n.on} ${dayStrs.slice(0, -1).join(', ')} ${i18n.and} ${dayStrs[dayStrs.length - 1]}`;
  }
}

/**
 * Build weekday phrase
 */
function buildWeekdayPhrase(
  weekdays: WeekdaySpec[],
  i18n: I18nStrings,
  locale: 'en' | 'ar'
): string {
  const dayNames = weekdays.map((wd) => i18n.weekdays[wd.weekday]);

  if (locale === 'ar') {
    if (dayNames.length === 1) {
      return `${i18n.in} ${dayNames[0]}`;
    }
    return `${i18n.in} ${dayNames.slice(0, -1).join('، ')} ${i18n.and} ${dayNames[dayNames.length - 1]}`;
  } else {
    if (dayNames.length === 1) {
      return `${i18n.on} ${dayNames[0]}`;
    }
    return `${i18n.on} ${dayNames.slice(0, -1).join(', ')} ${i18n.and} ${dayNames[dayNames.length - 1]}`;
  }
}

/**
 * Build nth weekday phrase (e.g., "first Friday")
 */
function buildNthWeekdayPhrase(
  weekdays: WeekdaySpec[],
  i18n: I18nStrings,
  locale: 'en' | 'ar'
): string {
  const phrases = weekdays.map((wd) => {
    const dayName = i18n.weekdays[wd.weekday];
    const ordinal = getOrdinal(wd.n || 1, i18n, locale);

    if (locale === 'ar') {
      return `${dayName} ${ordinal}`;
    } else {
      return `${i18n.the} ${ordinal} ${dayName}`;
    }
  });

  if (locale === 'ar') {
    if (phrases.length === 1) {
      return `${i18n.in} ${phrases[0]}`;
    }
    return `${i18n.in} ${phrases.slice(0, -1).join('، ')} ${i18n.and} ${phrases[phrases.length - 1]}`;
  } else {
    if (phrases.length === 1) {
      return `${i18n.on} ${phrases[0]}`;
    }
    return `${i18n.on} ${phrases.slice(0, -1).join(', ')} ${i18n.and} ${phrases[phrases.length - 1]}`;
  }
}

/**
 * Get ordinal string
 */
function getOrdinal(n: number, i18n: I18nStrings, locale: 'en' | 'ar'): string {
  if (n === -1) return i18n.last;
  if (n === -2) return i18n.secondLast;

  switch (n) {
    case 1:
      return i18n.first;
    case 2:
      return i18n.second;
    case 3:
      return i18n.third;
    case 4:
      return i18n.fourth;
    case 5:
      return i18n.fifth;
    default:
      if (locale === 'ar') {
        return String(n);
      }
      return formatOrdinal(n);
  }
}

/**
 * Build count phrase
 */
function buildCountPhrase(
  count: number,
  i18n: I18nStrings,
  locale: 'en' | 'ar'
): string {
  if (locale === 'ar') {
    if (count === 1) {
      return `${i18n.for} ${i18n.time} واحدة`;
    } else if (count === 2) {
      return `${i18n.for} مرتين`;
    } else {
      return `${i18n.for} ${count} ${i18n.times}`;
    }
  } else {
    if (count === 1) {
      return `${i18n.for} 1 ${i18n.time}`;
    }
    return `${i18n.for} ${count} ${i18n.times}`;
  }
}

/**
 * Build until phrase
 */
function buildUntilPhrase(
  until: { year: number; month: number; day: number },
  i18n: I18nStrings,
  locale: 'en' | 'ar'
): string {
  const monthName = i18n.monthNames[until.month];

  if (locale === 'ar') {
    return `${i18n.until} ${until.day} ${monthName} ${until.year}`;
  } else {
    return `${i18n.until} ${formatOrdinal(until.day)} ${monthName} ${until.year} AH`;
  }
}
