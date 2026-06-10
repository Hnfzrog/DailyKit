import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '../utils/storage';
import { todayKey } from '../utils/date';
import { genId } from '../utils/format';

export type EntryType = 'income' | 'expense';

export interface BudgetEntry {
  id: string;
  amount: number;
  label: string;
  type: EntryType;
  category: string;
  date: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'fx_budget';

export function useBudget() {
  const [entries, setEntries] = useState<BudgetEntry[]>(() =>
    storageGet<BudgetEntry[]>(STORAGE_KEY, [])
  );

  useEffect(() => {
    storageSet(STORAGE_KEY, entries);
  }, [entries]);

  function addEntry(entry: Omit<BudgetEntry, 'id'>) {
    setEntries((prev) => [...prev, { ...entry, id: genId() }]);
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const today = todayKey();
  const monthPrefix = today.slice(0, 7); // YYYY-MM

  const dailyBalance = entries
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + (e.type === 'income' ? e.amount : -e.amount), 0);

  const monthlyBalance = entries
    .filter((e) => e.date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + (e.type === 'income' ? e.amount : -e.amount), 0);

  const categoryBreakdown: Record<string, number> = {};
  for (const e of entries) {
    if (e.date.startsWith(monthPrefix) && e.type === 'expense') {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] ?? 0) + e.amount;
    }
  }

  const todayEntries = entries.filter((e) => e.date === today);

  return {
    entries,
    addEntry,
    removeEntry,
    dailyBalance,
    monthlyBalance,
    categoryBreakdown,
    todayEntries
  };
}
