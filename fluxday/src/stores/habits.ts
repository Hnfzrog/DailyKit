import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '../utils/storage';
import { todayKey, calcStreak } from '../utils/date';
import { genId } from '../utils/format';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  targetDays: number[]; // 0=Sun … 6=Sat
  log: string[];        // YYYY-MM-DD strings
}

const STORAGE_KEY = 'fx_habits';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() =>
    storageGet<Habit[]>(STORAGE_KEY, [])
  );

  useEffect(() => {
    storageSet(STORAGE_KEY, habits);
  }, [habits]);

  function addHabit(name: string, emoji: string, color: string, targetDays: number[]) {
    setHabits((prev) => [
      ...prev,
      { id: genId(), name, emoji, color, targetDays, log: [] }
    ]);
  }

  function toggleHabit(id: string, dateKey: string) {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const has = h.log.includes(dateKey);
        return {
          ...h,
          log: has ? h.log.filter((d) => d !== dateKey) : [...h.log, dateKey]
        };
      })
    );
  }

  function removeHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  const today = todayKey();
  const completedToday = habits.filter((h) => h.log.includes(today)).length;
  const bestStreak =
    habits.length === 0 ? 0 : Math.max(...habits.map((h) => calcStreak(h.log)));

  return { habits, addHabit, toggleHabit, removeHabit, completedToday, bestStreak, calcStreak };
}
