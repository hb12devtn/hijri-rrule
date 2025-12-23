import { Frequency } from '../types/frequency';

/**
 * Re-export Frequency enum values as constants for public API
 * Allows usage like: HijriRRule.YEARLY, HijriRRule.MONTHLY, etc.
 */
export const YEARLY = Frequency.YEARLY;
export const MONTHLY = Frequency.MONTHLY;
export const WEEKLY = Frequency.WEEKLY;
export const DAILY = Frequency.DAILY;
export const HOURLY = Frequency.HOURLY;
export const MINUTELY = Frequency.MINUTELY;
export const SECONDLY = Frequency.SECONDLY;
