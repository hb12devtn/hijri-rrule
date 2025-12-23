/**
 * Hijri Calendar Constants
 * Based on the Tabular Islamic Calendar algorithm
 */

/**
 * Julian Day Number of the Hijri epoch
 * July 16, 622 CE (Julian) / July 19, 622 CE (Gregorian)
 * This is 1 Muharram 1 AH
 */
export const HIJRI_EPOCH_JD = 1948439.5;

/**
 * Number of years in the Hijri lunar cycle
 */
export const LUNAR_CYCLE_YEARS = 30;

/**
 * Number of days in a complete 30-year Hijri cycle
 * (19 years × 354 days) + (11 leap years × 355 days) = 10631 days
 */
export const LUNAR_CYCLE_DAYS = 10631;

/**
 * Years within the 30-year cycle that are leap years
 * These years have 355 days instead of 354
 * Dhu al-Hijjah (month 12) has 30 days instead of 29
 */
export const LEAP_YEARS_IN_CYCLE = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];

/**
 * Number of days in a common (non-leap) Hijri year
 */
export const COMMON_YEAR_DAYS = 354;

/**
 * Number of days in a leap Hijri year
 */
export const LEAP_YEAR_DAYS = 355;

/**
 * Days in each Hijri month for a common year
 * Odd months have 30 days, even months have 29 days
 */
export const MONTH_DAYS: readonly number[] = [
  30, // Muharram (1)
  29, // Safar (2)
  30, // Rabi al-Awwal (3)
  29, // Rabi al-Thani (4)
  30, // Jumada al-Awwal (5)
  29, // Jumada al-Thani (6)
  30, // Rajab (7)
  29, // Shaban (8)
  30, // Ramadan (9)
  29, // Shawwal (10)
  30, // Dhu al-Qadah (11)
  29, // Dhu al-Hijjah (12) - becomes 30 in leap years
];

/**
 * Cumulative days before each month in a common year
 * Used for fast day-of-year calculations
 */
export const DAYS_BEFORE_MONTH: readonly number[] = [
  0,   // Before Muharram
  30,  // Before Safar
  59,  // Before Rabi al-Awwal
  89,  // Before Rabi al-Thani
  118, // Before Jumada al-Awwal
  147, // Before Jumada al-Thani
  177, // Before Rajab
  206, // Before Shaban
  236, // Before Ramadan
  265, // Before Shawwal
  295, // Before Dhu al-Qadah
  325, // Before Dhu al-Hijjah
];

/**
 * Number of months in a Hijri year
 */
export const MONTHS_IN_YEAR = 12;

/**
 * Maximum day number in any Hijri month
 */
export const MAX_MONTH_DAY = 30;

/**
 * Minimum day number
 */
export const MIN_MONTH_DAY = 1;

/**
 * Maximum valid Hijri month
 */
export const MAX_MONTH = 12;

/**
 * Minimum valid Hijri month
 */
export const MIN_MONTH = 1;
