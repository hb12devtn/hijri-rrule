/**
 * Script to generate Islamic (Hijri) month lengths dataset
 * from year 1356 to 1500 AH using IntlCalendarProvider
 *
 * Usage: npx ts-node scripts/generate-month-lengths.ts
 */

import { IntlCalendarProvider } from '../src/calendar/providers';

const START_YEAR = 1356;
const END_YEAR = 1500;

function generateMonthLengths(): void {
  const provider = new IntlCalendarProvider();
  const dataset: Record<number, number[]> = {};

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const monthLengths: number[] = [];

    for (let month = 1; month <= 12; month++) {
      const length = provider.getMonthLength(year, month);
      monthLengths.push(length);
    }

    dataset[year] = monthLengths;
  }

  // Output as TypeScript/JavaScript object
  console.log('export const HIJRI_MONTH_LENGTHS: Record<number, number[]> = {');
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const lengths = dataset[year].join(', ');
    const comma = year < END_YEAR ? ',' : '';
    console.log(`  ${year}: [${lengths}]${comma}`);
  }
  console.log('};');
}

generateMonthLengths();
