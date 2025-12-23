import {
  isLeapYear,
  getMonthLength,
  getYearLength,
  isValidHijriDate,
  getDaysBeforeMonth,
  getDayOfYear,
} from '../../../src/calendar/hijri-calendar';

// Use tabular calendar for tests that rely on tabular patterns
const TABULAR = 'islamic-tbla' as const;

describe('HijriCalendar', () => {
  describe('isLeapYear', () => {
    it('should identify leap years in the 30-year cycle', () => {
      // Leap years in cycle: 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
      expect(isLeapYear(2, TABULAR)).toBe(true);
      expect(isLeapYear(5, TABULAR)).toBe(true);
      expect(isLeapYear(7, TABULAR)).toBe(true);
      expect(isLeapYear(10, TABULAR)).toBe(true);
      expect(isLeapYear(13, TABULAR)).toBe(true);
      expect(isLeapYear(16, TABULAR)).toBe(true);
      expect(isLeapYear(18, TABULAR)).toBe(true);
      expect(isLeapYear(21, TABULAR)).toBe(true);
      expect(isLeapYear(24, TABULAR)).toBe(true);
      expect(isLeapYear(26, TABULAR)).toBe(true);
      expect(isLeapYear(29, TABULAR)).toBe(true);
    });

    it('should identify non-leap years', () => {
      expect(isLeapYear(1, TABULAR)).toBe(false);
      expect(isLeapYear(3, TABULAR)).toBe(false);
      expect(isLeapYear(4, TABULAR)).toBe(false);
      expect(isLeapYear(6, TABULAR)).toBe(false);
      expect(isLeapYear(30, TABULAR)).toBe(false);
    });

    it('should handle years beyond the first cycle', () => {
      // Year 32 is in the same position as year 2 (leap)
      expect(isLeapYear(32, TABULAR)).toBe(true);
      // Year 31 is in the same position as year 1 (non-leap)
      expect(isLeapYear(31, TABULAR)).toBe(false);
      // Year 1446 (modern Hijri year)
      expect(isLeapYear(1446, TABULAR)).toBe(false); // 1446 % 30 = 6, not a leap year
    });
  });

  describe('getMonthLength', () => {
    it('should return 30 days for odd months (tabular)', () => {
      expect(getMonthLength(1446, 1, TABULAR)).toBe(30); // Muharram
      expect(getMonthLength(1446, 3, TABULAR)).toBe(30); // Rabi al-Awwal
      expect(getMonthLength(1446, 5, TABULAR)).toBe(30); // Jumada al-Awwal
      expect(getMonthLength(1446, 7, TABULAR)).toBe(30); // Rajab
      expect(getMonthLength(1446, 9, TABULAR)).toBe(30); // Ramadan
      expect(getMonthLength(1446, 11, TABULAR)).toBe(30); // Dhu al-Qadah
    });

    it('should return 29 days for even months (tabular, except leap year month 12)', () => {
      expect(getMonthLength(1446, 2, TABULAR)).toBe(29); // Safar
      expect(getMonthLength(1446, 4, TABULAR)).toBe(29); // Rabi al-Thani
      expect(getMonthLength(1446, 6, TABULAR)).toBe(29); // Jumada al-Thani
      expect(getMonthLength(1446, 8, TABULAR)).toBe(29); // Shaban
      expect(getMonthLength(1446, 10, TABULAR)).toBe(29); // Shawwal
    });

    it('should return 29 days for Dhu al-Hijjah in non-leap years', () => {
      expect(getMonthLength(1446, 12, TABULAR)).toBe(29); // 1446 is not a leap year
      expect(getMonthLength(1, 12, TABULAR)).toBe(29); // Year 1 is not a leap year
    });

    it('should return 30 days for Dhu al-Hijjah in leap years', () => {
      expect(getMonthLength(2, 12, TABULAR)).toBe(30); // Year 2 is a leap year
      expect(getMonthLength(5, 12, TABULAR)).toBe(30); // Year 5 is a leap year
    });

    it('should throw for invalid months', () => {
      expect(() => getMonthLength(1446, 0)).toThrow();
      expect(() => getMonthLength(1446, 13)).toThrow();
    });
  });

  describe('getYearLength', () => {
    it('should return 354 days for non-leap years (tabular)', () => {
      expect(getYearLength(1, TABULAR)).toBe(354);
      expect(getYearLength(3, TABULAR)).toBe(354);
      expect(getYearLength(1446, TABULAR)).toBe(354);
    });

    it('should return 355 days for leap years (tabular)', () => {
      expect(getYearLength(2, TABULAR)).toBe(355);
      expect(getYearLength(5, TABULAR)).toBe(355);
      expect(getYearLength(7, TABULAR)).toBe(355);
    });
  });

  describe('isValidHijriDate (tabular)', () => {
    it('should validate correct dates', () => {
      expect(isValidHijriDate(1446, 1, 1)).toBe(true);
      expect(isValidHijriDate(1446, 12, 29)).toBe(true); // Non-leap year
    });

    it('should reject invalid years', () => {
      expect(isValidHijriDate(0, 1, 1)).toBe(false);
      expect(isValidHijriDate(-1, 1, 1)).toBe(false);
    });

    it('should reject invalid months', () => {
      expect(isValidHijriDate(1446, 0, 1)).toBe(false);
      expect(isValidHijriDate(1446, 13, 1)).toBe(false);
    });

    it('should reject invalid days', () => {
      expect(isValidHijriDate(1446, 1, 0)).toBe(false);
      expect(isValidHijriDate(1446, 1, 31)).toBe(false);
    });
  });

  describe('getDaysBeforeMonth', () => {
    it('should return 0 for Muharram', () => {
      expect(getDaysBeforeMonth(1446, 1)).toBe(0);
    });

    it('should return correct cumulative days', () => {
      expect(getDaysBeforeMonth(1446, 2)).toBe(30); // After Muharram
      expect(getDaysBeforeMonth(1446, 3)).toBe(59); // After Safar
      expect(getDaysBeforeMonth(1446, 9)).toBe(236); // Before Ramadan
    });
  });

  describe('getDayOfYear', () => {
    it('should return 1 for 1st Muharram', () => {
      expect(getDayOfYear(1446, 1, 1)).toBe(1);
    });

    it('should return correct day of year', () => {
      expect(getDayOfYear(1446, 2, 1)).toBe(31); // First day of Safar
      expect(getDayOfYear(1446, 9, 1)).toBe(237); // First day of Ramadan
    });
  });
});
