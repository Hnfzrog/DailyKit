/** Format helpers for Fluxday — currency, duration, etc. */

/** Formats a number as a currency string (IDR by default). */
export function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/** Formats seconds into mm:ss string. */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Clamps a string to a max length, appending ellipsis. */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '\u2026';
}

/** Generates a simple random UUID-like ID. */
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
