import { HijriDate } from '../calendar/hijri-date';

/**
 * Simple cache for storing computed recurrence results
 */
export class RRuleCache {
  private allCache: HijriDate[] | null = null;
  private afterCache: Map<string, HijriDate | null> = new Map();
  private beforeCache: Map<string, HijriDate | null> = new Map();
  private betweenCache: Map<string, HijriDate[]> = new Map();

  /**
   * Check if we have cached 'all' results
   */
  hasAll(): boolean {
    return this.allCache !== null;
  }

  /**
   * Get cached 'all' results
   */
  getAll(): HijriDate[] | null {
    return this.allCache;
  }

  /**
   * Set cached 'all' results
   */
  setAll(dates: HijriDate[]): void {
    this.allCache = dates;
  }

  /**
   * Get cached 'after' result
   */
  getAfter(dt: HijriDate, inclusive: boolean): HijriDate | null | undefined {
    const key = this.makeKey(dt, inclusive);
    return this.afterCache.has(key) ? this.afterCache.get(key) : undefined;
  }

  /**
   * Set cached 'after' result
   */
  setAfter(dt: HijriDate, inclusive: boolean, result: HijriDate | null): void {
    const key = this.makeKey(dt, inclusive);
    this.afterCache.set(key, result);
  }

  /**
   * Get cached 'before' result
   */
  getBefore(dt: HijriDate, inclusive: boolean): HijriDate | null | undefined {
    const key = this.makeKey(dt, inclusive);
    return this.beforeCache.has(key) ? this.beforeCache.get(key) : undefined;
  }

  /**
   * Set cached 'before' result
   */
  setBefore(dt: HijriDate, inclusive: boolean, result: HijriDate | null): void {
    const key = this.makeKey(dt, inclusive);
    this.beforeCache.set(key, result);
  }

  /**
   * Get cached 'between' result
   */
  getBetween(
    after: HijriDate,
    before: HijriDate,
    inclusive: boolean
  ): HijriDate[] | undefined {
    const key = this.makeBetweenKey(after, before, inclusive);
    return this.betweenCache.get(key);
  }

  /**
   * Set cached 'between' result
   */
  setBetween(
    after: HijriDate,
    before: HijriDate,
    inclusive: boolean,
    result: HijriDate[]
  ): void {
    const key = this.makeBetweenKey(after, before, inclusive);
    this.betweenCache.set(key, result);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.allCache = null;
    this.afterCache.clear();
    this.beforeCache.clear();
    this.betweenCache.clear();
  }

  /**
   * Create a cache key from date and inclusive flag
   */
  private makeKey(dt: HijriDate, inclusive: boolean): string {
    return `${dt.toString()}_${inclusive}`;
  }

  /**
   * Create a cache key for between queries
   */
  private makeBetweenKey(
    after: HijriDate,
    before: HijriDate,
    inclusive: boolean
  ): string {
    return `${after.toString()}_${before.toString()}_${inclusive}`;
  }
}
