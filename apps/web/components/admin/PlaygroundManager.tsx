'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { MediaAssetDto, PlaygroundItemDto, ProjectStatus } from '@portfolio/contracts';
import { api, ClientApiError } from '@/lib/client-api';

type PlaygroundForm = {
  title: string;
  slug: string;
  summary: string;
  type: string;
  status: ProjectStatus;
  content: Record<string, unknown>;
  thumbnailId: string | null;
  liveUrl: string;
  sourceUrl: string;
  sortOrder: number;
};

function emptyForm(): PlaygroundForm {
  return {
    title: '',
    slug: '',
    summary: '',
    type: 'EXPERIMENT',
    status: 'DRAFT',
    content: { note: '' },
    thumbnailId: null,
    liveUrl: '',
    sourceUrl: '',
    sortOrder: 0,
  };
}

export function PlaygroundManager({ initial }: { initial: PlaygroundItemDto[] }) {
  const [items, setItems] = useState(initial);
  const [media, setMedia] = useState<MediaAssetDto[]>([]);
  const [form, setForm] = useState<PlaygroundForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void api<MediaAssetDto[]>('/admin/media')
      .then(setMedia)
      .catch(() => undefined);
  }, []);

  function patch<K extends keyof PlaygroundForm>(key: K, value: PlaygroundForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    clearFeedback();
    const payload = {
      ...form,
      liveUrl: form.liveUrl || null,
      sourceUrl: form.sourceUrl || null,
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (editingId) {
        const updated = await api<PlaygroundItemDto>(`/admin/playground/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setItems((current) => current.map((item) => (item.id === editingId ? updated : item)));
        setMessage('Experiment updated.');
      } else {
        const created = await api<PlaygroundItemDto>('/admin/playground', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setItems((current) => [...current, created]);
        setMessage('Experiment created.');
      }

      setEditingId(null);
      setForm(emptyForm());
    } catch (cause) {
      setError(apiMessage(cause, 'Could not save experiment.'));
    } finally {
      setBusy(false);
    }
  }

  function edit(item: PlaygroundItemDto) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      type: item.type,
      status: item.status,
      content: item.content,
      thumbnailId: item.thumbnail?.id ?? null,
      liveUrl: item.liveUrl ?? '',
      sourceUrl: item.sourceUrl ?? '',
      sortOrder: item.sortOrder,
    });
  }

  async function remove(id: string) {
    if (!window.confirm('Delete playground item?')) return;
    setBusy(true);
    clearFeedback();
    try {
      await api(`/admin/playground/${id}`, { method: 'DELETE' });
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage('Experiment deleted.');
    } catch (cause) {
      setError(apiMessage(cause, 'Could not delete experiment.'));
    } finally {
      setBusy(false);
    }
  }

  async function move(item: PlaygroundItemDto, direction: -1 | 1) {
    const ordered = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex((candidate) => candidate.id === item.id);
    const targetIndex = index + direction;
    const target = ordered[targetIndex];
    if (index < 0 || !target) return;

    const previous = items;
    [ordered[index], ordered[targetIndex]] = [target, item];
    const next = ordered.map((candidate, sortOrder) => ({ ...candidate, sortOrder }));
    setItems(next);
    setBusy(true);
    clearFeedback();
    try {
      await api('/admin/playground/order', {
        method: 'PUT',
        body: JSON.stringify({ playgroundIds: next.map((candidate) => candidate.id) }),
      });
      setMessage('Playground order updated.');
    } catch (cause) {
      setItems(previous);
      setError(apiMessage(cause, 'Could not reorder experiments.'));
    } finally {
      setBusy(false);
    }
  }

  function clearFeedback() {
    setMessage('');
    setError('');
  }

  const note = typeof form.content.note === 'string' ? form.content.note : '';

  return (
    <div className="admin-split">
      <form className="admin-panel admin-form" onSubmit={submit}>
        <h2>{editingId ? 'Edit experiment' : 'New experiment'}</h2>
        <label>
          Title
          <input value={form.title} onChange={(e) => patch('title', e.target.value)} required />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(e) => patch('slug', e.target.value)} required />
        </label>
        <label>
          Summary
          <textarea
            rows={4}
            value={form.summary}
            onChange={(e) => patch('summary', e.target.value)}
            required
          />
        </label>

        <div className="form-grid two">
          <label>
            Type
            <input value={form.type} onChange={(e) => patch('type', e.target.value)} />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => patch('status', e.target.value as ProjectStatus)}
            >
              <option>DRAFT</option>
              <option>PUBLISHED</option>
              <option>ARCHIVED</option>
            </select>
          </label>
          <label>
            Live URL
            <input value={form.liveUrl} onChange={(e) => patch('liveUrl', e.target.value)} />
          </label>
          <label>
            Source URL
            <input value={form.sourceUrl} onChange={(e) => patch('sourceUrl', e.target.value)} />
          </label>
          <label>
            Thumbnail
            <select
              value={form.thumbnailId ?? ''}
              onChange={(e) => patch('thumbnailId', e.target.value || null)}
            >
              <option value="">None</option>
              {media.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.originalName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Order
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => patch('sortOrder', Number(e.target.value))}
            />
          </label>
        </div>

        <label>
          Internal note
          <textarea
            rows={3}
            value={note}
            onChange={(e) => patch('content', { ...form.content, note: e.target.value })}
          />
        </label>

        <div className="form-actions">
          <button className="button small" disabled={busy}>
            {busy ? 'working…' : editingId ? 'Save' : 'Create'}
          </button>
          {editingId && (
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm());
              }}
            >
              cancel
            </button>
          )}
        </div>
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
      </form>

      <section className="admin-panel resource-list">
        <h2>Experiments</h2>
        {[...items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item, index, ordered) => (
            <article key={item.id}>
              <div>
                <small>{item.type}</small>
                <strong>{item.title}</strong>
                <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
              <div>
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => void move(item, -1)}
                  aria-label={`Move ${item.title} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || index === ordered.length - 1}
                  onClick={() => void move(item, 1)}
                  aria-label={`Move ${item.title} down`}
                >
                  ↓
                </button>
                <button type="button" disabled={busy} onClick={() => edit(item)}>
                  edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="danger"
                  onClick={() => void remove(item.id)}
                >
                  delete
                </button>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}

function apiMessage(cause: unknown, fallback: string) {
  return cause instanceof ClientApiError ? cause.message : fallback;
}
