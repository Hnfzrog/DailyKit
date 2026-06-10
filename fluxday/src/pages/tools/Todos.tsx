import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useTodos } from '../../stores/todos';
import type { Todo, Priority } from '../../stores/todos';
import { todayKey } from '../../utils/date';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import styles from './Todos.module.css';

type View = 'today' | 'upcoming' | 'all' | string; // string for project views

const PRIORITY_LABEL: Record<Priority, string> = { low: 'Low', mid: 'Mid', high: 'High' };
const PRIORITY_VARIANT: Record<Priority, 'muted' | 'warning' | 'danger'> = {
  low: 'muted', mid: 'warning', high: 'danger'
};

interface NewTodoForm {
  title: string;
  notes: string;
  dueDate: string;
  project: string;
  priority: Priority;
}

const BLANK_FORM: NewTodoForm = {
  title: '', notes: '', dueDate: '', project: '', priority: 'mid'
};

export default function Todos() {
  const { todos, addTodo, toggleTodo, removeTodo } = useTodos();
  const [view, setView] = useState<View>('today');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<NewTodoForm>(BLANK_FORM);
  const titleRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setCreating(true);
        setForm(BLANK_FORM);
        setTimeout(() => titleRef.current?.focus(), 50);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const projects = [...new Set(todos.map((t) => t.project).filter(Boolean))];

  const today = todayKey();
  const filtered = todos.filter((t) => {
    if (view === 'today') return t.dueDate === today;
    if (view === 'upcoming') return t.dueDate && t.dueDate > today;
    if (view === 'all') return true;
    return t.project === view;
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTodo({
      title: form.title.trim(),
      notes: form.notes,
      dueDate: form.dueDate || null,
      project: form.project,
      priority: form.priority
    });
    setCreating(false);
    setForm(BLANK_FORM);
  }

  function handleCancel() {
    setCreating(false);
    setForm(BLANK_FORM);
  }

  function handleFormKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') handleCancel();
  }

  return (
    <div className={styles.page}>
      <Header title="Todos" subtitle="Press N to add a new task" />

      <div className={styles.layout}>
        {/* Sidebar views */}
        <aside className={styles.viewSidebar}>
          {['today', 'upcoming', 'all'].map((v) => (
            <button
              key={v}
              className={[styles.viewBtn, view === v ? styles.viewActive : ''].join(' ')}
              onClick={() => setView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          {projects.length > 0 && (
            <>
              <div className={styles.viewDivider} />
              <p className={styles.viewGroupLabel}>Projects</p>
              {projects.map((p) => (
                <button
                  key={p}
                  className={[styles.viewBtn, view === p ? styles.viewActive : ''].join(' ')}
                  onClick={() => setView(p)}
                >
                  {p}
                </button>
              ))}
            </>
          )}
        </aside>

        {/* Todo list */}
        <div className={styles.listArea}>
          <div className={styles.listHeader}>
            <span className={styles.listCount}>{filtered.length} items</span>
            <button
              id="todos-add-btn"
              className={styles.addBtn}
              onClick={() => { setCreating(true); setForm(BLANK_FORM); setTimeout(() => titleRef.current?.focus(), 50); }}
            >
              <Plus size={15} /> New Task
            </button>
          </div>

          {creating && (
            <Card style={{ marginBottom: 'var(--space-3)' }}>
              <form className={styles.newForm} onSubmit={handleSave} onKeyDown={handleFormKey}>
                <input
                  ref={titleRef}
                  id="todo-title-input"
                  className={styles.formInput}
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <div className={styles.formRow}>
                  <input
                    className={styles.formInput}
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                  <input
                    className={styles.formInput}
                    placeholder="Project tag"
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                  />
                  <select
                    className={styles.formInput}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                  >
                    <option value="low">Low</option>
                    <option value="mid">Mid</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <textarea
                  className={styles.formInput}
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                />
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveBtn}>Save</button>
                  <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            </Card>
          )}

          {filtered.length === 0 && !creating && (
            <div className={styles.empty}>No tasks here. Press N to add one.</div>
          )}

          <ul className={styles.todoList}>
            {filtered.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo(todo.id)}
                onRemove={() => removeTodo(todo.id)}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onRemove }: { todo: Todo; onToggle: () => void; onRemove: () => void }) {
  return (
    <li className={[styles.todoItem, todo.done ? styles.done : ''].join(' ')}>
      <button className={styles.checkBtn} onClick={onToggle} aria-label={todo.done ? 'Mark undone' : 'Mark done'}>
        {todo.done
          ? <CheckCircle2 size={20} color="var(--color-success)" />
          : <Circle size={20} color="var(--color-muted)" />}
      </button>
      <div className={styles.todoBody}>
        <span className={styles.todoTitle}>{todo.title}</span>
        {todo.notes && <span className={styles.todoNotes}>{todo.notes}</span>}
        <div className={styles.todoMeta}>
          {todo.dueDate && <Badge variant="muted">{todo.dueDate}</Badge>}
          {todo.project && <Badge variant="accent">{todo.project}</Badge>}
          <Badge variant={PRIORITY_VARIANT[todo.priority]}>{PRIORITY_LABEL[todo.priority]}</Badge>
        </div>
      </div>
      <button className={styles.removeBtn} onClick={onRemove} aria-label="Delete task">
        <Trash2 size={15} />
      </button>
    </li>
  );
}
