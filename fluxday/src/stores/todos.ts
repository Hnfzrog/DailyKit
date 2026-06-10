import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '../utils/storage';
import { todayKey } from '../utils/date';
import { genId } from '../utils/format';

export type Priority = 'low' | 'mid' | 'high';

export interface Todo {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;   // YYYY-MM-DD or null
  project: string;          // tag string
  priority: Priority;
  done: boolean;
  createdAt: string;        // ISO timestamp
}

const STORAGE_KEY = 'fx_todos';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() =>
    storageGet<Todo[]>(STORAGE_KEY, [])
  );

  useEffect(() => {
    storageSet(STORAGE_KEY, todos);
  }, [todos]);

  function addTodo(partial: Omit<Todo, 'id' | 'createdAt' | 'done'>) {
    setTodos((prev) => [
      ...prev,
      { ...partial, id: genId(), done: false, createdAt: new Date().toISOString() }
    ]);
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function updateTodo(id: string, changes: Partial<Omit<Todo, 'id' | 'createdAt'>>) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const todayTodos = todos.filter((t) => !t.done && t.dueDate === todayKey());
  const dueTodayCount = todayTodos.length;

  return { todos, addTodo, toggleTodo, updateTodo, removeTodo, todayTodos, dueTodayCount };
}
