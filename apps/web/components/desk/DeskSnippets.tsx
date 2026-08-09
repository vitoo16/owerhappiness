'use client';

import { type FormEvent, useMemo, useState } from 'react';
import type { DeskSnippet } from '@portfolio/contracts';
import { EmptyCollection, Feedback, formatDate } from './DeskNotes';
import { useDeskCollection } from './useDeskCollection';

const emptyDraft = { title: '', language: 'typescript', code: '', tags: '' };

export function DeskSnippets() {
  const collection = useDeskCollection('snippets', normalizeSnippets);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...collection.items]
      .filter(
        (snippet) =>
          !needle ||
          `${snippet.title} ${snippet.language} ${snippet.tags.join(' ')} ${snippet.code}`
            .toLowerCase()
            .includes(needle),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [collection.items, query]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.code.trim()) return;
    const now = new Date().toISOString();
    const existing = collection.items.find((item) => item.id === editingId);
    const snippet: DeskSnippet = {
      id: existing?.id ?? crypto.randomUUID(),
      title: draft.title.trim(),
      language: draft.language.trim() || 'text',
      code: draft.code,
      tags: splitTags(draft.tags),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const next = existing
      ? collection.items.map((item) => (item.id === existing.id ? snippet : item))
      : [snippet, ...collection.items];
    if (await collection.commit(next, existing ? 'Snippet updated.' : 'Snippet saved.')) reset();
  }

  function edit(snippet: DeskSnippet) {
    setEditingId(snippet.id);
    setDraft({
      title: snippet.title,
      language: snippet.language,
      code: snippet.code,
      tags: snippet.tags.join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(snippet: DeskSnippet) {
    if (!window.confirm(`Delete “${snippet.title}”?`)) return;
    if (
      (await collection.commit(
        collection.items.filter((item) => item.id !== snippet.id),
        'Snippet deleted.',
      )) &&
      editingId === snippet.id
    )
      reset();
  }

  function reset() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  return (
    <div className="desk-collection-layout">
      <form className="desk-editor-panel" onSubmit={submit}>
        <div className="panel-title">
          <div>
            <span className="eyebrow">{editingId ? 'EDIT SNIPPET' : 'NEW SNIPPET'}</span>
            <h2>{editingId ? 'Tune the reusable bit.' : 'Save the good bit.'}</h2>
          </div>
        </div>
        <label>
          Title
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            required
            maxLength={140}
          />
        </label>
        <div className="form-grid two">
          <label>
            Language
            <input
              value={draft.language}
              onChange={(event) =>
                setDraft((current) => ({ ...current, language: event.target.value }))
              }
              maxLength={40}
            />
          </label>
          <label>
            Tags
            <input
              value={draft.tags}
              onChange={(event) =>
                setDraft((current) => ({ ...current, tags: event.target.value }))
              }
              placeholder="api, auth, prisma"
            />
          </label>
        </div>
        <label>
          Code
          <textarea
            className="code-input"
            rows={16}
            value={draft.code}
            onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))}
            required
            spellCheck={false}
          />
        </label>
        <div className="form-actions">
          <button
            className="button small"
            disabled={collection.busy || !draft.title.trim() || !draft.code.trim()}
          >
            {collection.busy ? 'saving…' : editingId ? 'update snippet' : 'save snippet'}
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
            <span className="eyebrow">LIBRARY</span>
            <h2>
              {collection.items.length} snippet{collection.items.length === 1 ? '' : 's'}
            </h2>
          </div>
          <label>
            <span className="sr-only">Search snippets</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search code, tags…"
            />
          </label>
        </div>
        {collection.loading ? <p className="desk-loading">opening library…</p> : null}
        {!collection.loading && !visible.length ? (
          <EmptyCollection
            title="No snippets found."
            copy={query ? 'Try another search.' : 'Save the code you never want to rewrite.'}
          />
        ) : null}
        <div className="snippet-list">
          {visible.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={() => edit(snippet)}
              onDelete={() => void remove(snippet)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SnippetCard({
  snippet,
  onEdit,
  onDelete,
}: {
  snippet: DeskSnippet;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copyLabel, setCopyLabel] = useState('copy');
  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopyLabel('copied ✓');
      window.setTimeout(() => setCopyLabel('copy'), 1_500);
    } catch {
      setCopyLabel('failed');
    }
  }
  return (
    <article className="snippet-card">
      <header>
        <div>
          <span className="eyebrow">
            {snippet.language} · {formatDate(snippet.updatedAt)}
          </span>
          <h3>{snippet.title}</h3>
        </div>
        <button className="ghost-button" type="button" onClick={() => void copy()}>
          {copyLabel}
        </button>
      </header>
      <pre>
        <code>{snippet.code}</code>
      </pre>
      {snippet.tags.length ? (
        <div className="tags">
          {snippet.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <footer>
        <button type="button" onClick={onEdit}>
          edit
        </button>
        <button type="button" className="danger" onClick={onDelete}>
          delete
        </button>
      </footer>
    </article>
  );
}

function normalizeSnippets(value: unknown): DeskSnippet[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    return typeof record.id === 'string' &&
      typeof record.title === 'string' &&
      typeof record.code === 'string'
      ? [
          {
            id: record.id,
            title: record.title,
            language: typeof record.language === 'string' ? record.language : 'text',
            code: record.code,
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
