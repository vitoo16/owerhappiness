'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import type { DeskNote } from '@portfolio/contracts';
import { api, ClientApiError } from '@/lib/client-api';
import { useDeskCollection } from './useDeskCollection';

const emptyDraft = { title: '', body: '', pinned: false };

export function DeskNotes() {
  const collection = useDeskCollection('notes', normalizeNotes);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...collection.items]
      .filter((note) => !needle || `${note.title} ${note.body}`.toLowerCase().includes(needle))
      .sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt),
      );
  }, [collection.items, query]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title && !body) return;
    const now = new Date().toISOString();
    const existing = collection.items.find((note) => note.id === editingId);
    const note: DeskNote = {
      id: existing?.id ?? crypto.randomUUID(),
      title: title || 'Untitled note',
      body,
      pinned: draft.pinned,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const next = existing
      ? collection.items.map((item) => (item.id === existing.id ? note : item))
      : [note, ...collection.items];
    if (await collection.commit(next, existing ? 'Note updated.' : 'Note saved.')) resetDraft();
  }

  function edit(note: DeskNote) {
    setEditingId(note.id);
    setDraft({ title: note.title, body: note.body, pinned: note.pinned });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(note: DeskNote) {
    if (!window.confirm(`Delete “${note.title}”?`)) return;
    const next = collection.items.filter((item) => item.id !== note.id);
    if ((await collection.commit(next, 'Note deleted.')) && editingId === note.id) resetDraft();
  }

  async function togglePinned(note: DeskNote) {
    const now = new Date().toISOString();
    await collection.commit(
      collection.items.map((item) =>
        item.id === note.id ? { ...item, pinned: !item.pinned, updatedAt: now } : item,
      ),
      note.pinned ? 'Note unpinned.' : 'Note pinned.',
    );
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  return (
    <>
      <ScratchPad />
      <div className="desk-collection-layout">
        <form className="desk-editor-panel" onSubmit={submit}>
          <div className="panel-title">
            <div>
              <span className="eyebrow">{editingId ? 'EDIT NOTE' : 'NEW NOTE'}</span>
              <h2>{editingId ? 'Keep shaping it.' : 'Catch the thought.'}</h2>
            </div>
          </div>
          <label>
            Title
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              maxLength={140}
              placeholder="A useful title"
            />
          </label>
          <label>
            Note
            <textarea
              rows={13}
              value={draft.body}
              onChange={(event) =>
                setDraft((current) => ({ ...current, body: event.target.value }))
              }
              placeholder="Write it before it disappears…"
            />
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={draft.pinned}
              onChange={(event) =>
                setDraft((current) => ({ ...current, pinned: event.target.checked }))
              }
            />
            Pin this note
          </label>
          <div className="form-actions">
            <button
              className="button small"
              disabled={collection.busy || (!draft.title.trim() && !draft.body.trim())}
            >
              {collection.busy ? 'saving…' : editingId ? 'update note' : 'save note'}
            </button>
            {editingId ? (
              <button className="ghost-button" type="button" onClick={resetDraft}>
                cancel
              </button>
            ) : null}
          </div>
          <Feedback message={collection.message} error={collection.error} />
        </form>

        <section className="desk-collection-panel">
          <div className="collection-toolbar">
            <div>
              <span className="eyebrow">NOTEBOOK</span>
              <h2>
                {collection.items.length} note{collection.items.length === 1 ? '' : 's'}
              </h2>
            </div>
            <label>
              <span className="sr-only">Search notes</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes…"
              />
            </label>
          </div>
          {collection.loading ? <p className="desk-loading">opening notebook…</p> : null}
          {!collection.loading && !visible.length ? (
            <EmptyCollection
              title="No notes found."
              copy={query ? 'Try another search.' : 'Your first useful thought can live here.'}
            />
          ) : null}
          <div className="note-grid">
            {visible.map((note) => (
              <article className={`note-card ${note.pinned ? 'pinned' : ''}`} key={note.id}>
                <header>
                  <span>{note.pinned ? 'PINNED' : formatDate(note.updatedAt)}</span>
                  <button
                    type="button"
                    onClick={() => void togglePinned(note)}
                    aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
                  >
                    {note.pinned ? '◆' : '◇'}
                  </button>
                </header>
                <h3>{note.title}</h3>
                <p>{note.body || 'No body yet.'}</p>
                <footer>
                  <button type="button" onClick={() => edit(note)}>
                    edit
                  </button>
                  <button type="button" className="danger" onClick={() => void remove(note)}>
                    delete
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function ScratchPad() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('loading…');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api<string | null>('/desk/data/notes/main')
      .then((value) => {
        if (active) {
          setText(value ?? '');
          setStatus('');
        }
      })
      .catch(() => {
        if (active) setStatus('Could not load scratchpad.');
      });
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setBusy(true);
    setStatus('saving…');
    try {
      await api('/desk/data/notes/main', { method: 'PUT', body: JSON.stringify({ value: text }) });
      setStatus('saved.');
    } catch (cause) {
      setStatus(cause instanceof ClientApiError ? cause.message : 'Could not save scratchpad.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="scratch-strip">
      <div>
        <span className="eyebrow">QUICK SCRATCH</span>
        <h2>no title, no ceremony.</h2>
        <p>Your original scratchpad stays right here.</p>
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        placeholder="A temporary thought…"
      />
      <div>
        <button className="ghost-button" type="button" disabled={busy} onClick={() => void save()}>
          {busy ? 'saving…' : 'save scratch'}
        </button>
        <span role="status">{status}</span>
      </div>
    </section>
  );
}

export function Feedback({ message, error }: { message: string; error: string }) {
  return (
    <>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="form-success" role="status">
          {message}
        </p>
      ) : null}
    </>
  );
}

export function EmptyCollection({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="collection-empty">
      <strong>{title}</strong>
      <p>{copy}</p>
    </div>
  );
}

export function formatDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
    : 'recently';
}

function normalizeNotes(value: unknown): DeskNote[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    return typeof record.id === 'string' &&
      typeof record.title === 'string' &&
      typeof record.body === 'string'
      ? [
          {
            id: record.id,
            title: record.title,
            body: record.body,
            pinned: record.pinned === true,
            createdAt: stringOrNow(record.createdAt),
            updatedAt: stringOrNow(record.updatedAt),
          },
        ]
      : [];
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringOrNow(value: unknown) {
  return typeof value === 'string' ? value : new Date().toISOString();
}
