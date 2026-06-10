import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '../utils/storage';
import { todayKey } from '../utils/date';

export type Mood = '😔' | '😐' | '🙂' | '😊' | '🤩';

export interface JournalEntry {
  date: string;      // YYYY-MM-DD
  mood: Mood;
  text: string;
  updatedAt: string; // ISO timestamp
}

const STORAGE_KEY = 'fx_journal';

export function useJournal() {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(() =>
    storageGet<Record<string, JournalEntry>>(STORAGE_KEY, {})
  );

  useEffect(() => {
    storageSet(STORAGE_KEY, entries);
  }, [entries]);

  function saveEntry(date: string, text: string, mood: Mood) {
    setEntries((prev) => ({
      ...prev,
      [date]: { date, mood, text, updatedAt: new Date().toISOString() }
    }));
  }

  function removeEntry(date: string) {
    setEntries((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }

  const todayEntry = entries[todayKey()];

  return { entries, saveEntry, removeEntry, todayEntry };
}
