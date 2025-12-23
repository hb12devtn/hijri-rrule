/**
 * Frequency enum for recurrence rules
 * Maps to RFC 5545 FREQ property values
 */
export enum Frequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3,
  HOURLY = 4,
  MINUTELY = 5,
  SECONDLY = 6,
}

/**
 * String representations of frequency values
 */
export const FrequencyStr: Record<Frequency, string> = {
  [Frequency.YEARLY]: 'YEARLY',
  [Frequency.MONTHLY]: 'MONTHLY',
  [Frequency.WEEKLY]: 'WEEKLY',
  [Frequency.DAILY]: 'DAILY',
  [Frequency.HOURLY]: 'HOURLY',
  [Frequency.MINUTELY]: 'MINUTELY',
  [Frequency.SECONDLY]: 'SECONDLY',
};

/**
 * Reverse mapping from string to Frequency enum
 */
export const StrToFrequency: Record<string, Frequency> = {
  YEARLY: Frequency.YEARLY,
  MONTHLY: Frequency.MONTHLY,
  WEEKLY: Frequency.WEEKLY,
  DAILY: Frequency.DAILY,
  HOURLY: Frequency.HOURLY,
  MINUTELY: Frequency.MINUTELY,
  SECONDLY: Frequency.SECONDLY,
};
