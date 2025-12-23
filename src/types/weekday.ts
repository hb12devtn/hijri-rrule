/**
 * Weekday number constants
 * 0 = Saturday (Islamic week start), 6 = Friday
 * Note: This differs from JavaScript Date.getDay() where 0 = Sunday
 */
export enum WeekdayNum {
  SA = 0, // Saturday - traditional Islamic week start
  SU = 1, // Sunday
  MO = 2, // Monday
  TU = 3, // Tuesday
  WE = 4, // Wednesday
  TH = 5, // Thursday
  FR = 6, // Friday - Islamic holy day
}

/**
 * String representations of weekday values
 */
export const WeekdayStr: Record<WeekdayNum, string> = {
  [WeekdayNum.SA]: 'SA',
  [WeekdayNum.SU]: 'SU',
  [WeekdayNum.MO]: 'MO',
  [WeekdayNum.TU]: 'TU',
  [WeekdayNum.WE]: 'WE',
  [WeekdayNum.TH]: 'TH',
  [WeekdayNum.FR]: 'FR',
};

/**
 * Reverse mapping from string to WeekdayNum
 */
export const StrToWeekday: Record<string, WeekdayNum> = {
  SA: WeekdayNum.SA,
  SU: WeekdayNum.SU,
  MO: WeekdayNum.MO,
  TU: WeekdayNum.TU,
  WE: WeekdayNum.WE,
  TH: WeekdayNum.TH,
  FR: WeekdayNum.FR,
};

/**
 * Mapping from JavaScript Date.getDay() to our WeekdayNum
 * JS: 0=Sunday, 6=Saturday
 * Ours: 0=Saturday, 1=Sunday, ..., 6=Friday
 */
export function jsWeekdayToHijri(jsDay: number): WeekdayNum {
  // JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Hijri: 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
  return ((jsDay + 1) % 7) as WeekdayNum;
}

/**
 * Mapping from our WeekdayNum to JavaScript Date.getDay()
 */
export function hijriWeekdayToJs(hijriDay: WeekdayNum): number {
  // Reverse of jsWeekdayToHijri
  return (hijriDay + 6) % 7;
}

/**
 * Interface for a weekday with optional nth occurrence
 * e.g., { weekday: WeekdayNum.FR, n: 1 } means "first Friday"
 */
export interface WeekdaySpec {
  weekday: WeekdayNum;
  n?: number; // nth occurrence (positive or negative)
}
