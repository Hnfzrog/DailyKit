import { useState } from 'react';
import { Plus, Trash2, Flame } from 'lucide-react';
import { useHabits } from '../../stores/habits';
import { lastNDays, calcStreak, todayKey } from '../../utils/date';
import Header from '../../components/Header';
import Card from '../../components/Card';
import styles from './Habits.module.css';

const PRESET_COLORS = [
  '#7b68ee', '#4ade80', '#f87171', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa'
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Habits() {
  const { habits, addHabit, toggleHabit, removeHabit, completedToday, bestStreak } = useHabits();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✅');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const rollingWeek = lastNDays(7);

  function toggleTargetDay(d: number) {
    setTargetDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit(name.trim(), emoji, color, targetDays);
    setCreating(false);
    setName('');
    setEmoji('✅');
    setColor(PRESET_COLORS[0]);
    setTargetDays([0, 1, 2, 3, 4, 5, 6]);
  }

  return (
    <div className={styles.page}>
      <Header title="Habits" subtitle="Build streaks, one day at a time" />

      {/* Stats */}
      <div className={styles.stats}>
        <Card padding="var(--space-4)">
          <div className={styles.statItem}>
            <Flame size={20} color="var(--color-warning)" />
            <div>
              <div className={styles.statValue}>{bestStreak}</div>
              <div className={styles.statLabel}>Best Streak</div>
            </div>
          </div>
        </Card>
        <Card padding="var(--space-4)">
          <div className={styles.statItem}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div className={styles.statValue}>{completedToday}/{habits.length}</div>
              <div className={styles.statLabel}>Done Today</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Habit grid */}
      <div className={styles.gridWrapper}>
        {/* Day headers */}
        <div className={styles.gridHeader}>
          <div className={styles.habitNameCol} />
          {rollingWeek.map((d) => {
            const date = new Date(d + 'T00:00:00');
            return (
              <div key={d} className={styles.dayCell}>
                <span className={styles.dayName}>{DAYS_SHORT[date.getDay()]}</span>
                <span className={styles.dayNum}>{date.getDate()}</span>
              </div>
            );
          })}
          <div className={styles.streakCol}>Streak</div>
        </div>

        {habits.length === 0 && !creating && (
          <div className={styles.empty}>No habits yet. Add your first one below.</div>
        )}

        {habits.map((habit) => {
          const streak = calcStreak(habit.log);
          return (
            <div key={habit.id} className={styles.habitRow}>
              <div className={styles.habitNameCol}>
                <span className={styles.habitEmoji}>{habit.emoji}</span>
                <span className={styles.habitName}>{habit.name}</span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeHabit(habit.id)}
                  aria-label={`Remove ${habit.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {rollingWeek.map((d) => {
                const logged = habit.log.includes(d);
                const isToday = d === todayKey();
                return (
                  <button
                    key={d}
                    className={[
                      styles.dayCell,
                      styles.dayCellBtn,
                      logged ? styles.logged : '',
                      isToday ? styles.today : ''
                    ].join(' ')}
                    style={{ '--habit-color': habit.color } as React.CSSProperties}
                    onClick={() => toggleHabit(habit.id, d)}
                    aria-label={`Toggle ${habit.name} for ${d}`}
                    aria-pressed={logged}
                  />
                );
              })}
              <div className={styles.streakCol}>
                <span className={styles.streakNum}>{streak}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add habit form */}
      {creating ? (
        <Card>
          <form className={styles.addForm} onSubmit={handleAdd}>
            <h3 className={styles.formTitle}>New Habit</h3>
            <div className={styles.formRow}>
              <input
                id="habit-emoji-input"
                className={styles.emojiInput}
                placeholder="Emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
              />
              <input
                id="habit-name-input"
                className={styles.nameInput}
                placeholder="Habit name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className={styles.colorRow}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={[styles.colorDot, color === c ? styles.colorSelected : ''].join(' ')}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
            <div className={styles.targetRow}>
              {DAYS_SHORT.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  className={[styles.dayToggle, targetDays.includes(i) ? styles.dayToggleOn : ''].join(' ')}
                  onClick={() => toggleTargetDay(i)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn}>Add Habit</button>
              <button type="button" className={styles.cancelBtn} onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </form>
        </Card>
      ) : (
        <button id="habits-add-btn" className={styles.addHabitBtn} onClick={() => setCreating(true)}>
          <Plus size={16} /> Add Habit
        </button>
      )}
    </div>
  );
}
