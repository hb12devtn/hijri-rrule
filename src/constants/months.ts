/**
 * Hijri Month Names and Constants
 */

/**
 * Hijri month numbers
 */
export enum HijriMonth {
  MUHARRAM = 1,
  SAFAR = 2,
  RABI_AL_AWWAL = 3,
  RABI_AL_THANI = 4,
  JUMADA_AL_AWWAL = 5,
  JUMADA_AL_THANI = 6,
  RAJAB = 7,
  SHABAN = 8,
  RAMADAN = 9,
  SHAWWAL = 10,
  DHU_AL_QADAH = 11,
  DHU_AL_HIJJAH = 12,
}

/**
 * Re-export HijriMonth enum values as constants for public API
 * Allows usage like: HijriRRule.RAMADAN, HijriRRule.SHAWWAL, etc.
 */
export const MUHARRAM = HijriMonth.MUHARRAM;
export const SAFAR = HijriMonth.SAFAR;
export const RABI_AL_AWWAL = HijriMonth.RABI_AL_AWWAL;
export const RABI_AL_THANI = HijriMonth.RABI_AL_THANI;
export const JUMADA_AL_AWWAL = HijriMonth.JUMADA_AL_AWWAL;
export const JUMADA_AL_THANI = HijriMonth.JUMADA_AL_THANI;
export const RAJAB = HijriMonth.RAJAB;
export const SHABAN = HijriMonth.SHABAN;
export const RAMADAN = HijriMonth.RAMADAN;
export const SHAWWAL = HijriMonth.SHAWWAL;
export const DHU_AL_QADAH = HijriMonth.DHU_AL_QADAH;
export const DHU_AL_HIJJAH = HijriMonth.DHU_AL_HIJJAH;

/**
 * English names for Hijri months (index 0 = padding, 1-12 = months)
 */
export const MONTH_NAMES_EN: readonly string[] = [
  '', // Index 0 - not used
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
];

/**
 * Short English names for Hijri months
 */
export const MONTH_NAMES_SHORT_EN: readonly string[] = [
  '', // Index 0 - not used
  'Muh',
  'Saf',
  'Rb1',
  'Rb2',
  'Jm1',
  'Jm2',
  'Raj',
  'Sha',
  'Ram',
  'Shw',
  'Qad',
  'Hij',
];

/**
 * Arabic names for Hijri months
 */
export const MONTH_NAMES_AR: readonly string[] = [
  '', // Index 0 - not used
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
];

/**
 * Ordinal suffixes for English
 */
export const ORDINAL_SUFFIXES: Record<string, string> = {
  '1': 'st',
  '2': 'nd',
  '3': 'rd',
  '21': 'st',
  '22': 'nd',
  '23': 'rd',
  '31': 'st',
};

/**
 * Get ordinal suffix for a number
 */
export function getOrdinalSuffix(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) {
    return 'th';
  }
  return ORDINAL_SUFFIXES[String(n % 10)] || 'th';
}

/**
 * Format a day number with ordinal suffix
 */
export function formatOrdinal(n: number): string {
  return `${n}${getOrdinalSuffix(n)}`;
}
