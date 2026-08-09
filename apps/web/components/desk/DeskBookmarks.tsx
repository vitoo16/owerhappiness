'use client';

import { type FormEvent, useMemo, useState } from 'react';
import type { DeskBookmark } from '@portfolio/contracts';
import { EmptyCollection, Feedback, formatDate } from './DeskNotes';
import { useDeskCollection } from './useDeskCollection';

const emptyDraft = { title: '', url: '', description: '', tags: '' };

export function DeskBookmarks() {
  const collection = useDeskCollection('bookmarks', normalizeBookmarks);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...collection.items]
      .filter(
        (bookmark) =>
          !needle ||
          `${bookmark.title} ${bookmark.url} ${bookmark.description} ${bookmark.tags.join(' ')}`
            .toLowerCase()
            .includes(needle),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [collection.items, query]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const url = safeHttpUrl(draft.url);
    if (!url) {
      setValidationError('Use a complete http:// or https:// URL.');
      return;
    }
    setValidationError('');
    const now = new Date().toISOString();
    const existing = collection.items.find((item) => item.id === editingId);
    const bookmark: DeskBookmark = {
      id: existing?.id ?? crypto.randomUUID(),
      title: draft.title.trim(),
      url,
      description: draft.description.trim(),
      tags: splitTags(draft.tags),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const next = existing
      ? collection.items.map((item) => (item.id === existing.id ? bookmark : item))
      : [bookmark, ...collection.items];
    if (await collection.commit(next, existing ? 'Bookmark updated.' : 'Bookmark saved.')) reset();
  }

  function edit(bookmark: DeskBookmark) {
    setEditingId(bookmark.id);
    setDraft({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      tags: bookmark.tags.join(', '),
    });
    setValidationError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function remove(bookmark: DeskBookmark) {
    if (!window.confirm(`Delete “${bookmark.title}”?`)) return;
    if (
      (await collection.commit(
        collection.items.filter((item) => item.id !== bookmark.id),
        'Bookmark deleted.',
      )) &&
      editingId === bookmark.id
    )
      reset();
  }
  function reset() {
    setEditingId(null);
    setDraft(emptyDraft);
    setValidationError('');
  }

  return (
    <div className="desk-collection-layout">
      <form className="desk-editor-panel" onSubmit={submit}>
        <div className="panel-title">
          <div>
            <span className="eyebrow">{editingId ? 'EDIT BOOKMARK' : 'NEW BOOKMARK'}</span>
            <h2>{editingId ? 'Fix the trail.' : 'Save the rabbit hole.'}</h2>
          </div>
        </div>
        <label>
          Title
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            required
            maxLength={160}
          />
        </label>
        <label>
          URL
          <input
            type="url"
            value={draft.url}
            onChange={(event) => setDraft((current) => ({ ...current, url: event.target.value }))}
            required
            placeholder="https://…"
          />
        </label>
        <label>
          Description
          <textarea
            rows={5}
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Why is this worth keeping?"
          />
        </label>
        <label>
          Tags
          <input
            value={draft.tags}
            onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
            placeholder="design, reference, docs"
          />
        </label>
        {validationError ? (
          <p className="form-error" role="alert">
            {validationError}
          </p>
        ) : null}
        <div className="form-actions">
          <button
            className="button small"
            disabled={collection.busy || !draft.title.trim() || !draft.url.trim()}
          >
            {collection.busy ? 'saving…' : editingId ? 'update bookmark' : 'save bookmark'}
          </button>
          {editingId ? (
            <button type="button" className="ghost-button" onClick={reset}>
              cancel
            </button>
          ) : null}
        </div>
        <Feedback message={collection.message} error={collection.error} />
      </form>
      <section className="desk-collection-panel">
        <div className="collection-toolbar">
          <div>
            <span className="eyebrow">SAVED PLACES</span>
            <h2>
              {collection.items.length} bookmark{collection.items.length === 1 ? '' : 's'}
            </h2>
          </div>
          <label>
            <span className="sr-only">Search bookmarks</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search links, tags…"
            />
          </label>
        </div>
        {collection.loading ? <p className="desk-loading">opening bookmarks…</p> : null}
        {!collection.loading && !visible.length ? (
          <EmptyCollection
            title="No bookmarks found."
            copy={query ? 'Try another search.' : 'Save the useful corners of the internet.'}
          />
        ) : null}
        <div className="bookmark-list">
          {visible.map((bookmark) => (
            <article className="bookmark-card" key={bookmark.id}>
              <header>
                <span className="eyebrow">
                  {hostname(bookmark.url)} · {formatDate(bookmark.updatedAt)}
                </span>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${bookmark.title}`}
                >
                  ↗
                </a>
              </header>
              <h3>{bookmark.title}</h3>
              {bookmark.description ? <p>{bookmark.description}</p> : null}
              {bookmark.tags.length ? (
                <div className="tags">
                  {bookmark.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
              <footer>
                <button type="button" onClick={() => edit(bookmark)}>
                  edit
                </button>
                <button type="button" className="danger" onClick={() => void remove(bookmark)}>
                  delete
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function normalizeBookmarks(value: unknown): DeskBookmark[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    const url = typeof record.url === 'string' ? safeHttpUrl(record.url) : null;
    return typeof record.id === 'string' && typeof record.title === 'string' && url
      ? [
          {
            id: record.id,
            title: record.title,
            url,
            description: typeof record.description === 'string' ? record.description : '',
            tags: Array.isArray(record.tags)
              ? record.tags.filter((tag): tag is string => typeof tag === 'string')
              : [],
            createdAt:
              typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
            updatedAt:
              typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString(),
          },
        ]
      : [];
  });
}
function safeHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}
function hostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return 'link';
  }
}
function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function splitTags(value: string) {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ].slice(0, 12);
}
