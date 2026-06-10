import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '../utils/storage';

export interface FocusSession {
  date: string;       // YYYY-MM-DD
  duration: number;   // minutes
  label: string;
  completedAt: string; // ISO
}

export interface FocusSettings {
  workMinutes: number;
  breakMinutes: number;
}

export interface FocusData {
  settings: FocusSettings;
  history: FocusSession[];
}

const STORAGE_KEY = 'fx_focus';
const DEFAULT_DATA: FocusData = {
  settings: { workMinutes: 25, breakMinutes: 5 },
  history: []
};

export function useFocus() {
  const [focusData, setFocusData] = useState<FocusData>(() =>
    storageGet<FocusData>(STORAGE_KEY, DEFAULT_DATA)
  );

  useEffect(() => {
    storageSet(STORAGE_KEY, focusData);
  }, [focusData]);

  function updateSettings(settings: FocusSettings) {
    setFocusData((prev) => ({ ...prev, settings }));
  }

  function logSession(session: FocusSession) {
    setFocusData((prev) => ({
      ...prev,
      history: [session, ...prev.history]
    }));
  }

  return { focusData, updateSettings, logSession };
}
