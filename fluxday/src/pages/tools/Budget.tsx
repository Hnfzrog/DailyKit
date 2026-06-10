import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useBudget } from '../../stores/budget';
import type { EntryType } from '../../stores/budget';
import { todayKey } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import styles from './Budget.module.css';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Income', 'Other'];

export default function Budget() {
  const { addEntry, removeEntry, dailyBalance, monthlyBalance, categoryBreakdown, todayEntries } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<EntryType>('expense');
  const [category, setCategory] = useState('Other');
  const [date, setDate] = useState(todayKey());

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !label.trim()) return;
    addEntry({ amount: num, label: label.trim(), type, category, date });
    setAmount('');
    setLabel('');
    setShowForm(false);
  }

  const dailyPos = dailyBalance >= 0;
  const monthlyPos = monthlyBalance >= 0;

  // Category bar chart — get max expense
  const breakdown = Object.entries(categoryBreakdown);
  const maxCat = breakdown.length > 0 ? Math.max(...breakdown.map(([, v]) => v)) : 0;

  return (
    <div className={styles.page}>
      <Header title="Budget" subtitle="Track daily and monthly cash flow" />

      {/* Summary cards */}
      <div className={styles.summaryRow}>
        <Card padding="var(--space-5)">
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Today's Balance</div>
            <div className={styles.summaryValue} style={{ color: dailyPos ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {dailyPos ? '+' : '-'}{formatCurrency(Math.abs(dailyBalance))}
            </div>
            {dailyPos
              ? <TrendingUp size={18} color="var(--color-success)" />
              : <TrendingDown size={18} color="var(--color-danger)" />}
          </div>
        </Card>
        <Card padding="var(--space-5)">
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Monthly Balance</div>
            <div className={styles.summaryValue} style={{ color: monthlyPos ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {monthlyPos ? '+' : '-'}{formatCurrency(Math.abs(monthlyBalance))}
            </div>
            {monthlyPos
              ? <TrendingUp size={18} color="var(--color-success)" />
              : <TrendingDown size={18} color="var(--color-danger)" />}
          </div>
        </Card>
      </div>

      {/* Category bar chart (CSS only, no library) */}
      {breakdown.length > 0 && (
        <Card>
          <h3 className={styles.sectionTitle}>Monthly Expenses by Category</h3>
          <div className={styles.barChart}>
            {breakdown.sort(([, a], [, b]) => b - a).map(([cat, total]) => (
              <div key={cat} className={styles.barRow}>
                <span className={styles.barLabel}>{cat}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: maxCat > 0 ? `${(total / maxCat) * 100}%` : '0%' }}
                  />
                </div>
                <span className={styles.barValue}>{formatCurrency(total)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add entry */}
      <div className={styles.addSection}>
        {showForm ? (
          <Card>
            <form className={styles.addForm} onSubmit={handleAdd}>
              <h3 className={styles.sectionTitle}>New Entry</h3>
              <div className={styles.typeToggle}>
                <button
                  type="button"
                  className={[styles.typeBtn, type === 'expense' ? styles.typeDanger : ''].join(' ')}
                  onClick={() => setType('expense')}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={[styles.typeBtn, type === 'income' ? styles.typeSuccess : ''].join(' ')}
                  onClick={() => setType('income')}
                >
                  Income
                </button>
              </div>
              <div className={styles.formRow}>
                <input
                  id="budget-amount-input"
                  className={styles.formInput}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
                <input
                  className={styles.formInput}
                  placeholder="Label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <select
                  className={styles.formInput}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  className={styles.formInput}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn}>Add Entry</button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </Card>
        ) : (
          <button id="budget-add-btn" className={styles.addBtn} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Entry
          </button>
        )}
      </div>

      {/* Today entries */}
      <div>
        <h3 className={styles.sectionTitle}>Today</h3>
        {todayEntries.length === 0 ? (
          <div className={styles.empty}>No entries for today.</div>
        ) : (
          <ul className={styles.entryList}>
            {todayEntries.map((e) => (
              <li key={e.id} className={styles.entryItem}>
                <Badge variant={e.type === 'income' ? 'success' : 'danger'}>
                  {e.type === 'income' ? '+' : '-'}
                </Badge>
                <div className={styles.entryBody}>
                  <span className={styles.entryLabel}>{e.label}</span>
                  <span className={styles.entryCat}>{e.category}</span>
                </div>
                <span
                  className={styles.entryAmount}
                  style={{ color: e.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }}
                >
                  {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
                </span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeEntry(e.id)}
                  aria-label="Remove entry"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
