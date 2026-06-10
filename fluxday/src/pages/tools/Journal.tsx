import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useJournal } from '../../stores/journal';
import type { Mood } from '../../stores/journal';
import { todayKey, toDateKey } from '../../utils/date';
import Header from '../../components/Header';
import styles from './Journal.module.css';

const MOODS: { emoji: Mood; label: string }[] = [
  { emoji: '😔', label: 'Sad' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '🤩', label: 'Amazing' }
];

export default function Journal() {
  const { entries, saveEntry } = useJournal();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('🙂');
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Load entry when selected date changes
  useEffect(() => {
    const entry = entries[selectedDate];
    if (entry) {
      setText(entry.text);
      setMood(entry.mood);
    } else {
      setText('');
      setMood('🙂');
    }
  }, [selectedDate, entries]);

  // Auto-save debounced
  const save = useCallback(() => {
    if (text.trim() || mood) {
      saveEntry(selectedDate, text, mood);
    }
  }, [text, mood, selectedDate, saveEntry]);

  useEffect(() => {
    const t = setTimeout(save, 800);
    return () => clearTimeout(t);
  }, [text, mood, save]);

  // Calendar for month view
  const { year, month } = viewMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function prevMonth() {
    setViewMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  }

  function nextMonth() {
    setViewMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  }

  function selectDay(day: number) {
    const d = new Date(year, month, day);
    setSelectedDate(toDateKey(d));
  }

  const today = todayKey();

  return (
    <div className={styles.page}>
      <Header title="Journal" subtitle="One entry per day. Your thoughts, saved forever." />

      <div className={styles.layout}>
        {/* Month calendar */}
        <aside className={styles.calSidebar}>
          <div className={styles.calNav}>
            <button className={styles.calNavBtn} onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className={styles.calMonthLabel}>{monthLabel}</span>
            <button className={styles.calNavBtn} onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.calGrid}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} className={styles.calDayName}>{d}</div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateKey = toDateKey(new Date(year, month, day));
              const hasEntry = !!entries[dateKey];
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === today;
              return (
                <button
                  key={day}
                  className={[
                    styles.calDay,
                    isSelected ? styles.calSelected : '',
                    isToday ? styles.calToday : '',
                    hasEntry ? styles.calHasEntry : ''
                  ].join(' ')}
                  onClick={() => selectDay(day)}
                  aria-label={dateKey}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Editor */}
        <div className={styles.editorArea}>
          <div className={styles.editorHeader}>
            <span className={styles.editorDate}>{selectedDate}</span>
            <div className={styles.moodRow}>
              {MOODS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  className={[styles.moodBtn, mood === emoji ? styles.moodSelected : ''].join(' ')}
                  onClick={() => setMood(emoji)}
                  title={label}
                  aria-label={label}
                  aria-pressed={mood === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="journal-textarea"
            className={styles.editor}
            placeholder="Write your thoughts for the day…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className={styles.autoSaveHint}>Auto-saves as you type</p>
        </div>
      </div>
    </div>
  );
}
