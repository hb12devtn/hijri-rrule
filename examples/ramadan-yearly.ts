/**
 * Demo: Next 5 occurrences of 1st Ramadan yearly
 *
 * This example demonstrates how to create a recurrence rule for
 * an event that occurs every year on the 1st day of Ramadan.
 */

import { HijriRRule, HijriDate, gregorianToHijri, toText } from '../src/index';

// Create a rule for 1st of Ramadan every year
const rule = new HijriRRule({
  freq: HijriRRule.YEARLY,
  bymonth: 9, // Ramadan is month 9
  bymonthday: 1,
  dtstart: new HijriDate(1446, 9, 1), // Start from Ramadan 1446 AH
  count: 5,
});

console.log('=== Hijri RRULE Library Demo ===\n');
console.log('Rule: First day of Ramadan every year\n');

// Show the RRULE string representation
console.log('RRULE String:');
console.log(rule.toString());
console.log();

// Show human-readable text (English)
console.log('Human-readable (English):');
console.log(toText(rule.options, 'en'));
console.log();

// Show human-readable text (Arabic)
console.log('Human-readable (Arabic):');
console.log(toText(rule.options, 'ar'));
console.log();

// Get all occurrences
console.log('Next 5 occurrences of 1st Ramadan:');
console.log('─'.repeat(60));

const hijriDates = rule.allHijri();

hijriDates.forEach((hijriDate, index) => {
  const gregorianDate = hijriDate.toGregorian();

  console.log(`${index + 1}. Hijri:     ${hijriDate.toLocaleDateString('en')}`);
  console.log(`   Gregorian: ${gregorianDate.toDateString()}`);
  console.log(`   ISO:       ${hijriDate.toString()}`);
  console.log();
});

// Additional examples
console.log('=== Additional Examples ===\n');

// Example 2: Monthly recurrence on the 15th
console.log('Example 2: Every month on the 15th');
const monthlyRule = new HijriRRule({
  freq: HijriRRule.MONTHLY,
  bymonthday: 15,
  dtstart: new HijriDate(1446, 1, 15),
  count: 3,
});
console.log(monthlyRule.toString());
console.log();

// Example 3: Weekly on Friday (Jumu'ah)
console.log('Example 3: Every Friday (Jumu\'ah)');
const weeklyRule = new HijriRRule({
  freq: HijriRRule.WEEKLY,
  byweekday: [HijriRRule.FR],
  dtstart: new HijriDate(1446, 1, 1),
  count: 3,
});
console.log(weeklyRule.toString());
console.log();

// Example 4: Last day of Ramadan
console.log('Example 4: Last day of Ramadan (Eid eve)');
const lastDayRule = new HijriRRule({
  freq: HijriRRule.YEARLY,
  bymonth: 9, // Ramadan
  bymonthday: 30, // Note: Will be skipped if month only has 29 days
  dtstart: new HijriDate(1446, 9, 30),
  count: 3,
});
console.log(lastDayRule.toString());
console.log();

// Example 5: Convert today's date
console.log('Example 5: Today\'s date in Hijri');
const today = new Date();
const todayHijri = gregorianToHijri(today);
console.log(`Gregorian: ${today.toDateString()}`);
console.log(`Hijri:     ${todayHijri.toLocaleDateString('en')}`);
