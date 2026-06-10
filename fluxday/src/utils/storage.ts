/**
 * Typed localStorage wrapper for Fluxday.
 * All keys must use the fx_ prefix.
 */

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full; silently fail
  }
}

export function storageRemove(key: string): void {
  localStorage.removeItem(key);
}

/** Returns all fx_ prefixed entries as a plain object (for export). */
export function exportAllFxData(): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('fx_')) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) result[key] = JSON.parse(raw);
      } catch {
        // skip corrupt keys
      }
    }
  }
  return result;
}

/** Imports an exported data object back into localStorage. */
export function importFxData(data: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('fx_')) {
      storageSet(key, value);
    }
  }
}
