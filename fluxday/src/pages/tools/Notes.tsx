import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, StickyNote, FileText } from 'lucide-react';
import { useNotes } from '../../stores/notes';
import Header from '../../components/Header';
import Card from '../../components/Card';
import styles from './Notes.module.css';

export default function Notes() {
  const { notes, addNote, updateNote, removeNote } = useNotes();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Local editor states for smooth typing
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const activeIdRef = useRef<string | null>(null);

  // Set first note active if none active and notes exist
  useEffect(() => {
    if (notes.length > 0 && !activeId) {
      setActiveId(notes[0].id);
    } else if (notes.length === 0) {
      setActiveId(null);
    }
  }, [notes, activeId]);

  // Sync editor fields when active note changes
  useEffect(() => {
    activeIdRef.current = activeId;
    if (activeId) {
      const note = notes.find((n) => n.id === activeId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      }
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeId]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!activeId) return;

    // Find the current actual state of the note to see if we changed anything
    const currentNote = notes.find((n) => n.id === activeId);
    if (currentNote && (currentNote.title !== title || currentNote.content !== content)) {
      const handler = setTimeout(() => {
        // Double check active ID matches before updating
        if (activeIdRef.current === activeId) {
          updateNote(activeId, title, content);
        }
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [title, content, activeId, updateNote, notes]);

  function handleCreate() {
    const newId = addNote('New Note');
    setActiveId(newId);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      removeNote(id);
      if (activeId === id) {
        setActiveId(null);
      }
    }
  }

  // Format date helper
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={styles.page}>
      <Header title="Notes" subtitle="Quick scratchpad, auto-saved instantly" />

      <div className={styles.layout}>
        {/* Notes list sidebar */}
        <aside className={styles.sidebar}>
          <button className={styles.newBtn} onClick={handleCreate} aria-label="Create new note">
            <Plus size={16} /> New Note
          </button>

          <div className={styles.notesList}>
            {notes.map((note) => {
              const isActive = note.id === activeId;
              return (
                <div
                  key={note.id}
                  className={[styles.noteTab, isActive ? styles.activeTab : ''].join(' ')}
                  onClick={() => setActiveId(note.id)}
                >
                  <FileText size={16} className={styles.noteIcon} />
                  <div className={styles.noteMeta}>
                    <span className={styles.noteTitle}>{note.title || 'Untitled Note'}</span>
                    <span className={styles.noteTime}>{formatTime(note.updatedAt)}</span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(note.id, e)}
                    aria-label={`Delete ${note.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Notes Editor area */}
        <main className={styles.editorContainer}>
          {activeId ? (
            <Card className={styles.editorCard}>
              <input
                id="notes-title-input"
                type="text"
                className={styles.titleInput}
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                id="notes-content-textarea"
                className={styles.contentInput}
                placeholder="Start writing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Card>
          ) : (
            <div className={styles.emptyState}>
              <StickyNote size={48} className={styles.emptyIcon} />
              <h3>No note selected</h3>
              <p>Select an existing note or create a new one to get started.</p>
              <button className={styles.createBtn} onClick={handleCreate} aria-label="Create note">
                Create Note
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
