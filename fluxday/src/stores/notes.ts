import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '../utils/storage';
import { genId } from '../utils/format';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string; // ISO timestamp
}

const STORAGE_KEY = 'fx_notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() =>
    storageGet<Note[]>(STORAGE_KEY, [])
  );

  useEffect(() => {
    storageSet(STORAGE_KEY, notes);
  }, [notes]);

  function addNote(title = 'Untitled Note') {
    const newNote: Note = {
      id: genId(),
      title,
      content: '',
      updatedAt: new Date().toISOString()
    };
    setNotes((prev) => [...prev, newNote]);
    return newNote.id;
  }

  function updateNote(id: string, title: string, content: string) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, title, content, updatedAt: new Date().toISOString() }
          : n
      )
    );
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return { notes, addNote, updateNote, removeNote };
}
