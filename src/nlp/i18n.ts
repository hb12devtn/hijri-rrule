/**
 * Internationalization strings for NLP module
 */

export interface I18nStrings {
  // Frequency words
  every: string;
  yearly: string;
  monthly: string;
  weekly: string;
  daily: string;
  hourly: string;
  minutely: string;
  secondly: string;

  // Interval words
  year: string;
  years: string;
  month: string;
  months: string;
  week: string;
  weeks: string;
  day: string;
  days: string;

  // Conjunction
  and: string;
  or: string;
  on: string;
  in: string;
  the: string;
  of: string;

  // Time words
  for: string;
  times: string;
  time: string;
  until: string;

  // Ordinals
  first: string;
  second: string;
  third: string;
  fourth: string;
  fifth: string;
  last: string;
  secondLast: string;

  // Weekdays
  weekdays: string[];

  // Months
  monthNames: string[];

  // Day formatting
  dayPrefix: string; // e.g., "day" or "اليوم"
}

/**
 * English strings
 */
export const EN: I18nStrings = {
  every: 'every',
  yearly: 'year',
  monthly: 'month',
  weekly: 'week',
  daily: 'day',
  hourly: 'hour',
  minutely: 'minute',
  secondly: 'second',

  year: 'year',
  years: 'years',
  month: 'month',
  months: 'months',
  week: 'week',
  weeks: 'weeks',
  day: 'day',
  days: 'days',

  and: 'and',
  or: 'or',
  on: 'on',
  in: 'in',
  the: 'the',
  of: 'of',

  for: 'for',
  times: 'times',
  time: 'time',
  until: 'until',

  first: 'first',
  second: 'second',
  third: 'third',
  fourth: 'fourth',
  fifth: 'fifth',
  last: 'last',
  secondLast: 'second last',

  weekdays: [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ],

  monthNames: [
    '',
    'Muharram',
    'Safar',
    "Rabi' al-Awwal",
    "Rabi' al-Thani",
    'Jumada al-Awwal',
    'Jumada al-Thani',
    'Rajab',
    "Sha'ban",
    'Ramadan',
    'Shawwal',
    "Dhu al-Qa'dah",
    'Dhu al-Hijjah',
  ],

  dayPrefix: 'day',
};

/**
 * Arabic strings
 */
export const AR: I18nStrings = {
  every: 'كل',
  yearly: 'سنة',
  monthly: 'شهر',
  weekly: 'أسبوع',
  daily: 'يوم',
  hourly: 'ساعة',
  minutely: 'دقيقة',
  secondly: 'ثانية',

  year: 'سنة',
  years: 'سنوات',
  month: 'شهر',
  months: 'أشهر',
  week: 'أسبوع',
  weeks: 'أسابيع',
  day: 'يوم',
  days: 'أيام',

  and: 'و',
  or: 'أو',
  on: 'في',
  in: 'في',
  the: '',
  of: 'من',

  for: 'لمدة',
  times: 'مرات',
  time: 'مرة',
  until: 'حتى',

  first: 'الأول',
  second: 'الثاني',
  third: 'الثالث',
  fourth: 'الرابع',
  fifth: 'الخامس',
  last: 'الأخير',
  secondLast: 'قبل الأخير',

  weekdays: [
    'السبت',
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
  ],

  monthNames: [
    '',
    'مُحَرَّم',
    'صَفَر',
    'رَبِيع الأَوَّل',
    'رَبِيع الثَّانِي',
    'جُمَادَى الأُولَى',
    'جُمَادَى الآخِرَة',
    'رَجَب',
    'شَعْبَان',
    'رَمَضَان',
    'شَوَّال',
    'ذُو القَعْدَة',
    'ذُو الحِجَّة',
  ],

  dayPrefix: 'اليوم',
};

/**
 * Get I18n strings for a locale
 */
export function getI18n(locale: 'en' | 'ar'): I18nStrings {
  return locale === 'ar' ? AR : EN;
}
