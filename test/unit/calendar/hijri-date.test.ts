import { HijriDate } from '../../../src/calendar/hijri-date';
// Import converter to initialize toGregorian
import '../../../src/calendar/hijri-converter';
import { setCalendarConfig, getCalendarConfig } from '../../../src/calendar/config';

describe('HijriDate', () => {
  // Store original config to restore after tests
  let originalConfig: ReturnType<typeof getCalendarConfig>;

  beforeAll(() => {
    originalConfig = getCalendarConfig();
    // Use tabular calendar for predictable test behavior
    setCalendarConfig({ defaultCalendar: 'islamic-tbla' });
  });

  afterAll(() => {
    // Restore original config
    setCalendarConfig(originalConfig);
  });

  describe('constructor', () => {
    it('should create a valid date', () => {
      const date = new HijriDate(1446, 9, 1);
      expect(date.year).toBe(1446);
      expect(date.month).toBe(9);
      expect(date.day).toBe(1);
    });

    it('should create a date with time', () => {
      const date = new HijriDate(1446, 9, 1, 10, 30, 0);
      expect(date.hour).toBe(10);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(0);
    });

    it('should throw for invalid month', () => {
      expect(() => new HijriDate(1446, 13, 1)).toThrow();
      expect(() => new HijriDate(1446, 0, 1)).toThrow();
    });

    it('should throw for invalid day', () => {
      expect(() => new HijriDate(1446, 2, 30)).toThrow(); // Safar has 29 days in tabular
      expect(() => new HijriDate(1446, 1, 31)).toThrow();
      expect(() => new HijriDate(1446, 1, 0)).toThrow();
    });

    it('should allow day 30 in Dhu al-Hijjah for leap years', () => {
      expect(() => new HijriDate(2, 12, 30)).not.toThrow(); // Year 2 is leap in tabular
    });

    it('should throw for day 30 in Dhu al-Hijjah for non-leap years', () => {
      expect(() => new HijriDate(1, 12, 30)).toThrow(); // Year 1 is not leap in tabular
    });
  });

  describe('comparison methods', () => {
    it('should compare dates correctly with equals', () => {
      const date1 = new HijriDate(1446, 9, 1);
      const date2 = new HijriDate(1446, 9, 1);
      const date3 = new HijriDate(1446, 9, 2);

      expect(date1.equals(date2)).toBe(true);
      expect(date1.equals(date3)).toBe(false);
    });

    it('should compare dates correctly with isBefore', () => {
      const date1 = new HijriDate(1446, 9, 1);
      const date2 = new HijriDate(1446, 9, 2);
      const date3 = new HijriDate(1447, 1, 1);

      expect(date1.isBefore(date2)).toBe(true);
      expect(date2.isBefore(date1)).toBe(false);
      expect(date1.isBefore(date3)).toBe(true);
    });

    it('should compare dates correctly with isAfter', () => {
      const date1 = new HijriDate(1446, 9, 1);
      const date2 = new HijriDate(1446, 8, 1);

      expect(date1.isAfter(date2)).toBe(true);
      expect(date2.isAfter(date1)).toBe(false);
    });

    it('should compare dates correctly with compare', () => {
      const date1 = new HijriDate(1446, 9, 1);
      const date2 = new HijriDate(1446, 9, 2);
      const date3 = new HijriDate(1446, 9, 1);

      expect(date1.compare(date2)).toBeLessThan(0);
      expect(date2.compare(date1)).toBeGreaterThan(0);
      expect(date1.compare(date3)).toBe(0);
    });
  });

  describe('formatting methods', () => {
    it('should format as ISO-like string', () => {
      const date = new HijriDate(1446, 9, 1);
      expect(date.toString()).toBe('1446-09-01');
    });

    it('should format with locale (English)', () => {
      const date = new HijriDate(1446, 9, 1);
      expect(date.toLocaleDateString('en')).toBe('1 Ramadan 1446 AH');
    });

    it('should format with locale (Arabic)', () => {
      const date = new HijriDate(1446, 9, 1);
      expect(date.toLocaleDateString('ar')).toBe('1 رَمَضَان 1446');
    });

    it('should format for RRULE', () => {
      const date = new HijriDate(1446, 9, 1);
      expect(date.toRRuleString()).toBe('14460901');

      const dateWithTime = new HijriDate(1446, 9, 1, 10, 30, 0);
      expect(dateWithTime.toRRuleString(true)).toBe('14460901T103000');
    });
  });

  describe('static methods', () => {
    it('should parse from RRULE string', () => {
      const date = HijriDate.fromRRuleString('14460901');
      expect(date.year).toBe(1446);
      expect(date.month).toBe(9);
      expect(date.day).toBe(1);
    });

    it('should parse from RRULE string with time', () => {
      const date = HijriDate.fromRRuleString('14460901T103000');
      expect(date.year).toBe(1446);
      expect(date.month).toBe(9);
      expect(date.day).toBe(1);
      expect(date.hour).toBe(10);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(0);
    });

    it('should throw for invalid RRULE string', () => {
      expect(() => HijriDate.fromRRuleString('invalid')).toThrow();
    });
  });

  describe('clone', () => {
    it('should create an independent copy', () => {
      const date1 = new HijriDate(1446, 9, 1);
      const date2 = date1.clone();

      expect(date2.equals(date1)).toBe(true);
      expect(date2).not.toBe(date1);
    });
  });

  describe('getDayOfYear', () => {
    it('should return correct day of year', () => {
      const date = new HijriDate(1446, 9, 1);
      expect(date.getDayOfYear()).toBe(237); // 1st of Ramadan
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days in month', () => {
      const ramadan = new HijriDate(1446, 9, 1);
      expect(ramadan.getDaysInMonth()).toBe(30);

      const safar = new HijriDate(1446, 2, 1);
      expect(safar.getDaysInMonth()).toBe(29);
    });
  });
});
