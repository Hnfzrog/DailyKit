import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CalendarCheck,
  Wallet,
  Timer,
  BookOpen,
  ArrowRight,
  Plus,
  Flame
} from 'lucide-react';
import { useTodos } from '../stores/todos';
import { useHabits } from '../stores/habits';
import { useBudget } from '../stores/budget';
import { useJournal } from '../stores/journal';
import { useFocus } from '../stores/focus';
import { getGreeting, formatDateLong, todayKey } from '../utils/date';
import { formatCurrency, truncate } from '../utils/format';
import { storageGet } from '../utils/storage';
import Card from '../components/Card';
import Badge from '../components/Badge';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const userName = storageGet<{ userName?: string }>('fx_settings', {}).userName ?? 'there';
  const { dueTodayCount, addTodo } = useTodos();
  const { bestStreak, completedToday, habits } = useHabits();
  const { dailyBalance } = useBudget();
  const { todayEntry } = useJournal();
  const { focusData } = useFocus();

  const [quickTodo, setQuickTodo] = useState('');

  function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quickTodo.trim();
    if (!title) return;
    addTodo({
      title,
      notes: '',
      dueDate: todayKey(),
      project: '',
      priority: 'mid'
    });
    setQuickTodo('');
  }

  const balancePositive = dailyBalance >= 0;
  const todaySessionCount = focusData.history.filter(
    (s) => s.date === todayKey()
  ).length;

  const greeting = getGreeting();
  const dateStr = formatDateLong();

  return (
    <div className={styles.page}>
      {/* Hero greeting */}
      <section className={styles.hero}>
        <div>
          <p className={styles.greeting}>{greeting}, {userName} 👋</p>
          <h1 className={styles.heroTitle}>Your day, in one place.</h1>
          <p className={styles.heroDate}>{dateStr}</p>
        </div>
      </section>

      {/* Summary widgets */}
      <section className={styles.widgets}>
        {/* Habits */}
        <Link to="/tools/habits" className={styles.widgetLink}>
          <Card hoverable>
            <div className={styles.widgetInner}>
              <div className={styles.widgetIcon} style={{ background: 'rgba(123,104,238,0.15)' }}>
                <CalendarCheck size={20} color="var(--color-accent)" />
              </div>
              <div className={styles.widgetBody}>
                <span className={styles.widgetLabel}>Best Streak</span>
                <span className={styles.widgetValue}>
                  <Flame size={16} color="var(--color-warning)" style={{ marginRight: 4 }} />
                  {bestStreak} days
                </span>
              </div>
              <Badge variant={completedToday === habits.length && habits.length > 0 ? 'success' : 'muted'}>
                {completedToday}/{habits.length}
              </Badge>
            </div>
          </Card>
        </Link>

        {/* Todos */}
        <Link to="/tools/todos" className={styles.widgetLink}>
          <Card hoverable>
            <div className={styles.widgetInner}>
              <div className={styles.widgetIcon} style={{ background: 'rgba(74,222,128,0.12)' }}>
                <CheckSquare size={20} color="var(--color-success)" />
              </div>
              <div className={styles.widgetBody}>
                <span className={styles.widgetLabel}>Due Today</span>
                <span className={styles.widgetValue}>{dueTodayCount} tasks</span>
              </div>
              <Badge variant={dueTodayCount === 0 ? 'success' : 'warning'}>
                {dueTodayCount === 0 ? 'Clear' : 'Open'}
              </Badge>
            </div>
          </Card>
        </Link>

        {/* Budget */}
        <Link to="/tools/budget" className={styles.widgetLink}>
          <Card hoverable>
            <div className={styles.widgetInner}>
              <div className={styles.widgetIcon} style={{ background: balancePositive ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)' }}>
                <Wallet size={20} color={balancePositive ? 'var(--color-success)' : 'var(--color-danger)'} />
              </div>
              <div className={styles.widgetBody}>
                <span className={styles.widgetLabel}>Today Balance</span>
                <span className={styles.widgetValue} style={{ color: balancePositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {formatCurrency(Math.abs(dailyBalance))}
                </span>
              </div>
              <Badge variant={balancePositive ? 'success' : 'danger'}>
                {balancePositive ? '+' : '-'}
              </Badge>
            </div>
          </Card>
        </Link>

        {/* Focus */}
        <Link to="/tools/focus" className={styles.widgetLink}>
          <Card hoverable>
            <div className={styles.widgetInner}>
              <div className={styles.widgetIcon} style={{ background: 'rgba(251,191,36,0.12)' }}>
                <Timer size={20} color="var(--color-warning)" />
              </div>
              <div className={styles.widgetBody}>
                <span className={styles.widgetLabel}>Focus Sessions</span>
                <span className={styles.widgetValue}>{todaySessionCount} today</span>
              </div>
              <Badge variant="muted">{focusData.settings.workMinutes}m</Badge>
            </div>
          </Card>
        </Link>
      </section>

      {/* Quick add todo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Add Todo</h2>
        <form className={styles.quickForm} onSubmit={handleQuickAdd}>
          <input
            id="dashboard-quick-todo"
            type="text"
            className={styles.quickInput}
            placeholder="What do you need to do today?"
            value={quickTodo}
            onChange={(e) => setQuickTodo(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className={styles.quickBtn} aria-label="Add todo">
            <Plus size={18} />
          </button>
        </form>
      </section>

      {/* Journal preview */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Today's Journal</h2>
          <Link to="/tools/journal" className={styles.seeAll}>
            Open <ArrowRight size={14} />
          </Link>
        </div>
        <Card>
          {todayEntry ? (
            <div className={styles.journalPreview}>
              <span className={styles.journalMood}>{todayEntry.mood}</span>
              <p className={styles.journalText}>
                {truncate(todayEntry.text, 80)}
              </p>
            </div>
          ) : (
            <Link to="/tools/journal" className={styles.journalEmpty}>
              <BookOpen size={24} color="var(--color-muted)" />
              <span>No entry yet — write something today</span>
            </Link>
          )}
        </Card>
      </section>
    </div>
  );
}
