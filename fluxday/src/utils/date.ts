/** Date helpers for Fluxday — streak math, today key, etc. */

/** Returns today's date key in YYYY-MM-DD format. */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Converts a Date to YYYY-MM-DD string. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses a YYYY-MM-DD key back to a local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calculates the consecutive streak count from an array of logged date strings
 * (YYYY-MM-DD), counted backwards from today.
 */
export function calcStreak(log: string[]): number {
  if (log.length === 0) return 0;
  const logSet = new Set(log);
  const today = new Date();
  let streak = 0;
  const cursor = new Date(today);

  // If today is not logged, start checking from yesterday
  if (!logSet.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (logSet.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Returns the current time-of-day greeting. */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

/** Returns a formatted date string like "Wednesday, June 11". */
export function formatDateLong(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

/** Returns an array of date keys for the last N days (inclusive of today). */
export function lastNDays(n: number): string[] {
  const days: string[] = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

/** Check if a date string is today. */
export function isToday(dateKey: string): boolean {
  return dateKey === todayKey();
}

/** Check if a date is before today. */
export function isPast(dateKey: string): boolean {
  return dateKey < todayKey();
}
