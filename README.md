# Hijri RRULE

A JavaScript/TypeScript library for working with recurrence rules (RRULE) for the Hijri (Islamic) calendar, compatible with RFC 5545.

[![npm version](https://badge.fury.io/js/hijri-rrule.svg)](https://www.npmjs.com/package/hijri-rrule)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Full RRULE Support**: YEARLY, MONTHLY, WEEKLY, DAILY frequencies with BYMONTH, BYMONTHDAY, BYDAY, COUNT, UNTIL, INTERVAL
- **Hijri Calendar**: Accurate Hijri date handling with leap year support (30-year cycle)
- **Bidirectional Conversion**: Convert between Gregorian and Hijri dates
- **API Compatible**: Mirrors the popular [rrule.js](https://github.com/jkbrzt/rrule) library API
- **TypeScript**: Full TypeScript support with comprehensive type definitions
- **NLP Support**: Human-readable text output in English and Arabic
- **Zero Dependencies**: No external runtime dependencies

## Installation

```bash
npm install hijri-rrule
# or
yarn add hijri-rrule
```

## Quick Start

```typescript
import { HijriRRule, HijriDate } from 'hijri-rrule';

// Create a rule for 1st of Ramadan every year
const rule = new HijriRRule({
  freq: HijriRRule.YEARLY,
  bymonth: HijriRRule.RAMADAN,  // Use named constant (or 9)
  bymonthday: 1,
  dtstart: new HijriDate(1446, 9, 1),
  count: 5
});

// Get all occurrences as JavaScript Date objects
const dates = rule.all();

// Get occurrences as HijriDate objects
const hijriDates = rule.allHijri();

// Get string representation
console.log(rule.toString());
// DTSTART;CALENDAR=HIJRI:14460901
// RRULE:FREQ=YEARLY;BYMONTH=9;BYMONTHDAY=1;COUNT=5

// Human-readable text
console.log(rule.toText());
// "every year in Ramadan on the 1st for 5 times"
```

## API Reference

### HijriRRule

The main class for creating recurrence rules.

#### Constructor

```typescript
new HijriRRule(options: PartialOptions, noCache?: boolean)
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `freq` | `Frequency` | **Required**. YEARLY, MONTHLY, WEEKLY, DAILY |
| `dtstart` | `HijriDate \| Date` | Start date (defaults to current date) |
| `interval` | `number` | Interval between occurrences (default: 1) |
| `count` | `number` | Number of occurrences to generate |
| `until` | `HijriDate \| Date` | End date limit |
| `bymonth` | `number \| number[]` | Months (1-12, where 1=Muharram, 9=Ramadan) |
| `bymonthday` | `number \| number[]` | Days of month (1-30) |
| `byweekday` | `Weekday \| Weekday[]` | Days of week (SA, SU, MO, TU, WE, TH, FR) |
| `bysetpos` | `number \| number[]` | Position within frequency period |
| `wkst` | `Weekday` | Week start day (default: SU) |

#### Methods

```typescript
// Get all occurrences
rule.all(): Date[]
rule.allHijri(): HijriDate[]

// Get occurrences in a range
rule.between(after: Date, before: Date, inc?: boolean): Date[]
rule.betweenHijri(after: HijriDate, before: HijriDate, inc?: boolean): HijriDate[]

// Get first occurrence after a date
rule.after(dt: Date, inc?: boolean): Date | null
rule.afterHijri(dt: HijriDate, inc?: boolean): HijriDate | null

// Get last occurrence before a date
rule.before(dt: Date, inc?: boolean): Date | null
rule.beforeHijri(dt: HijriDate, inc?: boolean): HijriDate | null

// String representation
rule.toString(): string
rule.toText(locale?: 'en' | 'ar'): string

// Static methods
HijriRRule.fromString(str: string): HijriRRule
HijriRRule.parseString(str: string): PartialOptions
```

#### Frequency Constants

```typescript
HijriRRule.YEARLY   // 0
HijriRRule.MONTHLY  // 1
HijriRRule.WEEKLY   // 2
HijriRRule.DAILY    // 3
```

#### Weekday Constants

```typescript
HijriRRule.SA  // Saturday (0)
HijriRRule.SU  // Sunday (1)
HijriRRule.MO  // Monday (2)
HijriRRule.TU  // Tuesday (3)
HijriRRule.WE  // Wednesday (4)
HijriRRule.TH  // Thursday (5)
HijriRRule.FR  // Friday (6)
```

#### Month Constants

```typescript
HijriRRule.MUHARRAM       // 1
HijriRRule.SAFAR          // 2
HijriRRule.RABI_AL_AWWAL  // 3
HijriRRule.RABI_AL_THANI  // 4
HijriRRule.JUMADA_AL_AWWAL // 5
HijriRRule.JUMADA_AL_THANI // 6
HijriRRule.RAJAB          // 7
HijriRRule.SHABAN         // 8
HijriRRule.RAMADAN        // 9
HijriRRule.SHAWWAL        // 10
HijriRRule.DHU_AL_QADAH   // 11
HijriRRule.DHU_AL_HIJJAH  // 12

// Usage example
const rule = new HijriRRule({
  freq: HijriRRule.YEARLY,
  bymonth: HijriRRule.RAMADAN,  // Instead of magic number 9
  bymonthday: 1,
  dtstart: new HijriDate(1446, 9, 1),
  count: 5
});
```

### HijriDate

Immutable value object representing a Hijri calendar date.

```typescript
// Create a date
const date = new HijriDate(1446, 9, 1);  // 1 Ramadan 1446

// With time
const dateTime = new HijriDate(1446, 9, 1, 10, 30, 0);

// From Gregorian
import { gregorianToHijri } from 'hijri-rrule';
const hijri = gregorianToHijri(new Date());

// To Gregorian
const gregorian = date.toGregorian();

// Formatting
date.toString();              // "1446-09-01"
date.toLocaleDateString('en'); // "1 Ramadan 1446 AH"
date.toLocaleDateString('ar'); // "1 رَمَضَان 1446"
```

### HijriRRuleSet

Combine multiple rules with specific dates and exclusions.

```typescript
import { HijriRRuleSet, HijriRRule, HijriDate } from 'hijri-rrule';

const ruleSet = new HijriRRuleSet();

// Add a rule
ruleSet.rrule(new HijriRRule({
  freq: HijriRRule.MONTHLY,
  bymonthday: 1,
  dtstart: new HijriDate(1446, 1, 1)
}));

// Add specific dates
ruleSet.rdate(new HijriDate(1446, 6, 15));

// Exclude dates
ruleSet.exdate(new HijriDate(1446, 3, 1));

// Get all occurrences
const dates = ruleSet.all();
```

### Parsing RRULE Strings

```typescript
import { hijriRuleStr, HijriRRule } from 'hijri-rrule';

// Parse an RRULE string
const rule = HijriRRule.fromString(
  'DTSTART:14460901\nRRULE:FREQ=YEARLY;BYMONTH=9;BYMONTHDAY=1;COUNT=5'
);

// Or use hijriRuleStr for more options
const ruleOrSet = hijriRuleStr('FREQ=YEARLY;BYMONTH=9', {
  dtstart: new HijriDate(1446, 1, 1),
  forceset: true  // Always return RRuleSet
});
```

## Hijri Calendar Reference

### Months

| Number | Name | Arabic | Days |
|--------|------|--------|------|
| 1 | Muharram | مُحَرَّم | 30 |
| 2 | Safar | صَفَر | 29 |
| 3 | Rabi' al-Awwal | رَبِيع الأَوَّل | 30 |
| 4 | Rabi' al-Thani | رَبِيع الثَّانِي | 29 |
| 5 | Jumada al-Awwal | جُمَادَى الأُولَى | 30 |
| 6 | Jumada al-Thani | جُمَادَى الآخِرَة | 29 |
| 7 | Rajab | رَجَب | 30 |
| 8 | Sha'ban | شَعْبَان | 29 |
| 9 | Ramadan | رَمَضَان | 30 |
| 10 | Shawwal | شَوَّال | 29 |
| 11 | Dhu al-Qa'dah | ذُو القَعْدَة | 30 |
| 12 | Dhu al-Hijjah | ذُو الحِجَّة | 29 (30 in leap years) |

### Leap Years

The Hijri calendar uses a 30-year cycle with 11 leap years: **2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29**

In leap years, Dhu al-Hijjah (month 12) has 30 days instead of 29.

## Edge Cases

### BYMONTHDAY=30 in 29-day months

When a rule specifies day 30 but the month only has 29 days, the occurrence is **skipped**.

```typescript
const rule = new HijriRRule({
  freq: HijriRRule.MONTHLY,
  bymonthday: 30,
  dtstart: new HijriDate(1446, 1, 30),
  count: 3
});

// Returns: Muharram 30, Rabi al-Awwal 30, Jumada al-Awwal 30
// (Safar, Rabi al-Thani skipped as they have 29 days)
```

## Examples

### Islamic Holidays

```typescript
// Eid al-Fitr (1st Shawwal)
const eidFitr = new HijriRRule({
  freq: HijriRRule.YEARLY,
  bymonth: 10,
  bymonthday: 1,
  dtstart: new HijriDate(1446, 10, 1),
  count: 10
});

// Eid al-Adha (10th Dhu al-Hijjah)
const eidAdha = new HijriRRule({
  freq: HijriRRule.YEARLY,
  bymonth: 12,
  bymonthday: 10,
  dtstart: new HijriDate(1446, 12, 10),
  count: 10
});

// Friday prayers (Jumu'ah)
const jumuah = new HijriRRule({
  freq: HijriRRule.WEEKLY,
  byweekday: [HijriRRule.FR],
  dtstart: new HijriDate(1446, 1, 1),
  count: 52
});
```

### Date Conversion

```typescript
import { gregorianToHijri, hijriToGregorian, HijriDate } from 'hijri-rrule';

// Gregorian to Hijri
const today = new Date();
const todayHijri = gregorianToHijri(today);
console.log(todayHijri.toLocaleDateString('en'));

// Hijri to Gregorian
const ramadan1 = new HijriDate(1446, 9, 1);
const gregorianDate = hijriToGregorian(ramadan1);
console.log(gregorianDate.toDateString());
```

## Browser Support

Works in all modern browsers and Node.js 16+.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgments

- Inspired by [rrule.js](https://github.com/jkbrzt/rrule)
- Hijri calendar algorithm based on the [Tabular Islamic Calendar](https://en.wikipedia.org/wiki/Tabular_Islamic_calendar)
