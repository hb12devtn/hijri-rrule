import { HijriRRule, HijriDate, hijriRuleStr, Skip, setCalendarConfig, getCalendarConfig } from '../../../src';

// Use tabular calendar for predictable test behavior
const TABULAR = 'islamic-tbla' as const;

describe('HijriRRule', () => {
  // Store original config to restore after tests
  let originalConfig: ReturnType<typeof getCalendarConfig>;

  beforeAll(() => {
    originalConfig = getCalendarConfig();
    // Use tabular calendar for predictable test behavior
    setCalendarConfig({ defaultCalendar: TABULAR });
  });

  afterAll(() => {
    // Restore original config
    setCalendarConfig(originalConfig);
  });

  describe('constructor', () => {
    it('should create a yearly rule', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.YEARLY,
        dtstart: new HijriDate(1446, 9, 1),
        count: 5,
        calendar: TABULAR,
      });

      expect(rule.options.freq).toBe(HijriRRule.YEARLY);
      expect(rule.options.count).toBe(5);
    });

    it('should create a monthly rule', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.MONTHLY,
        bymonthday: 15,
        dtstart: new HijriDate(1446, 1, 15),
        count: 3,
        calendar: TABULAR,
      });

      expect(rule.options.freq).toBe(HijriRRule.MONTHLY);
      expect(rule.options.bymonthday).toEqual([15]);
    });

    it('should create a weekly rule', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.WEEKLY,
        byweekday: [HijriRRule.FR],
        dtstart: new HijriDate(1446, 1, 1),
        count: 4,
        calendar: TABULAR,
      });

      expect(rule.options.freq).toBe(HijriRRule.WEEKLY);
    });
  });

  describe('all()', () => {
    it('should return all occurrences for yearly rule on 1st Ramadan', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.YEARLY,
        bymonth: 9,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 9, 1),
        count: 5,
        calendar: TABULAR,
      });

      const dates = rule.allHijri();

      expect(dates.length).toBe(5);
      expect(dates[0].year).toBe(1446);
      expect(dates[0].month).toBe(9);
      expect(dates[0].day).toBe(1);

      expect(dates[1].year).toBe(1447);
      expect(dates[1].month).toBe(9);
      expect(dates[1].day).toBe(1);
    });

    it('should return all occurrences for monthly rule', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.MONTHLY,
        bymonthday: 15,
        dtstart: new HijriDate(1446, 1, 15),
        count: 3,
        calendar: TABULAR,
      });

      const dates = rule.allHijri();

      expect(dates.length).toBe(3);
      expect(dates[0].toString()).toBe('1446-01-15');
      expect(dates[1].toString()).toBe('1446-02-15');
      expect(dates[2].toString()).toBe('1446-03-15');
    });

    it('should skip invalid days (BYMONTHDAY=30 in 29-day month) - default strategy', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.MONTHLY,
        bymonthday: 30,
        dtstart: new HijriDate(1446, 1, 30), // Muharram has 30 days in tabular
        count: 3,
        calendar: TABULAR,
      });

      const dates = rule.allHijri();

      // Should skip months with only 29 days (tabular: even months have 29 days)
      // Muharram (30), Safar (29-skip), Rabi al-Awwal (30)
      expect(dates.length).toBe(3);
      expect(dates[0].month).toBe(1); // Muharram
      expect(dates[1].month).toBe(3); // Rabi al-Awwal (skipped Safar)
      expect(dates[2].month).toBe(5); // Jumada al-Awwal (skipped Rabi al-Thani)
    });

    it('should move backward to last day of month with BACKWARD strategy', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.MONTHLY,
        bymonthday: 30,
        dtstart: new HijriDate(1446, 1, 30), // Muharram has 30 days in tabular
        count: 3,
        skip: Skip.BACKWARD,
        calendar: TABULAR,
      });

      const dates = rule.allHijri();

      // Should use last day of 29-day months
      // Muharram (30), Safar (29), Rabi al-Awwal (30)
      expect(dates.length).toBe(3);
      expect(dates[0].month).toBe(1);
      expect(dates[0].day).toBe(30); // Muharram 30
      expect(dates[1].month).toBe(2);
      expect(dates[1].day).toBe(29); // Safar 29 (last day)
      expect(dates[2].month).toBe(3);
      expect(dates[2].day).toBe(30); // Rabi al-Awwal 30
    });

    it('should move forward to 1st of next month with FORWARD strategy', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.MONTHLY,
        bymonthday: 30,
        dtstart: new HijriDate(1446, 1, 30), // Muharram has 30 days in tabular
        count: 3,
        skip: Skip.FORWARD,
        calendar: TABULAR,
      });

      const dates = rule.allHijri();

      // Should move to 1st of next month for 29-day months
      // Muharram (30), Safar day 30 -> Rabi I day 1, Rabi I (30)
      expect(dates.length).toBe(3);
      expect(dates[0].month).toBe(1);
      expect(dates[0].day).toBe(30); // Muharram 30
      expect(dates[1].month).toBe(3);
      expect(dates[1].day).toBe(1); // Safar 30 -> Rabi al-Awwal 1
      expect(dates[2].month).toBe(3);
      expect(dates[2].day).toBe(30); // Rabi al-Awwal 30
    });

    it('should use iterator callback', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.YEARLY,
        bymonth: 9,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 9, 1),
        count: 10,
        calendar: TABULAR,
      });

      const dates = rule.allHijri((date, i) => {
        return i < 3; // Stop after 3 occurrences
      });

      expect(dates.length).toBe(3);
    });
  });

  describe('between()', () => {
    it('should return occurrences between two dates', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.MONTHLY,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 1, 1),
        calendar: TABULAR,
      });

      const start = new HijriDate(1446, 3, 1);
      const end = new HijriDate(1446, 6, 1);

      const dates = rule.betweenHijri(start, end);

      // Should include 4, 5 (exclusive of 3 and 6)
      expect(dates.length).toBe(2);
      expect(dates[0].month).toBe(4);
      expect(dates[1].month).toBe(5);
    });

    it('should include boundaries when inc=true', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.MONTHLY,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 1, 1),
        calendar: TABULAR,
      });

      const start = new HijriDate(1446, 3, 1);
      const end = new HijriDate(1446, 6, 1);

      const dates = rule.betweenHijri(start, end, true);

      // Should include 3, 4, 5, 6 (inclusive)
      expect(dates.length).toBe(4);
    });
  });

  describe('after()', () => {
    it('should return first occurrence after date', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.YEARLY,
        bymonth: 9,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 9, 1),
        calendar: TABULAR,
      });

      const date = rule.afterHijri(new HijriDate(1446, 9, 2));
      expect(date?.year).toBe(1447);
      expect(date?.month).toBe(9);
    });

    it('should include date when inc=true', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.YEARLY,
        bymonth: 9,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 9, 1),
        calendar: TABULAR,
      });

      const date = rule.afterHijri(new HijriDate(1446, 9, 1), true);
      expect(date?.year).toBe(1446);
      expect(date?.month).toBe(9);
    });
  });

  describe('before()', () => {
    it('should return last occurrence before date', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.YEARLY,
        bymonth: 9,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 9, 1),
        calendar: TABULAR,
      });

      const date = rule.beforeHijri(new HijriDate(1448, 1, 1));
      expect(date?.year).toBe(1447);
      expect(date?.month).toBe(9);
    });
  });

  describe('toString()', () => {
    it('should generate valid RRULE string', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.YEARLY,
        bymonth: 9,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 9, 1),
        count: 5,
        calendar: TABULAR,
      });

      const str = rule.toString();

      expect(str).toContain('DTSTART');
      expect(str).toContain('14460901');
      expect(str).toContain('FREQ=YEARLY');
      expect(str).toContain('BYMONTH=9');
      expect(str).toContain('BYMONTHDAY=1');
      expect(str).toContain('COUNT=5');
    });
  });

  describe('fromString()', () => {
    it('should parse RRULE string', () => {
      const rule = HijriRRule.fromString(
        'DTSTART:14460901\nRRULE:FREQ=YEARLY;BYMONTH=9;BYMONTHDAY=1;COUNT=5'
      );

      expect(rule.options.freq).toBe(HijriRRule.YEARLY);
      expect(rule.options.bymonth).toEqual([9]);
      expect(rule.options.bymonthday).toEqual([1]);
      expect(rule.options.count).toBe(5);
    });

    it('should parse bare RRULE string', () => {
      const rule = HijriRRule.fromString('FREQ=MONTHLY;BYMONTHDAY=15;COUNT=3');

      expect(rule.options.freq).toBe(HijriRRule.MONTHLY);
      expect(rule.options.bymonthday).toEqual([15]);
    });
  });

  describe('clone()', () => {
    it('should create independent copy', () => {
      const rule1 = new HijriRRule({
        freq: HijriRRule.YEARLY,
        bymonth: 9,
        dtstart: new HijriDate(1446, 9, 1),
        count: 5,
        calendar: TABULAR,
      });

      const rule2 = rule1.clone();

      expect(rule2.options.freq).toBe(rule1.options.freq);
      expect(rule2.options.count).toBe(rule1.options.count);
      expect(rule2).not.toBe(rule1);
    });
  });

  describe('iterator', () => {
    it('should be iterable', () => {
      const rule = new HijriRRule({
        freq: HijriRRule.YEARLY,
        bymonth: 9,
        bymonthday: 1,
        dtstart: new HijriDate(1446, 9, 1),
        count: 3,
        calendar: TABULAR,
      });

      const dates: Date[] = [];
      for (const date of rule) {
        dates.push(date);
      }

      expect(dates.length).toBe(3);
    });
  });
});

describe('hijriRuleStr', () => {
  it('should parse single rule', () => {
    const rule = hijriRuleStr('FREQ=YEARLY;BYMONTH=9;COUNT=3');

    expect(rule).toBeInstanceOf(HijriRRule);
    expect((rule as HijriRRule).options.freq).toBe(HijriRRule.YEARLY);
  });

  it('should return RRuleSet when forceset=true', () => {
    const ruleSet = hijriRuleStr('FREQ=YEARLY;BYMONTH=9', { forceset: true });

    expect(ruleSet).not.toBeInstanceOf(HijriRRule);
    expect(ruleSet.rrules().length).toBe(1);
  });
});
