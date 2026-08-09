'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { MediaAssetDto, MilestoneDto } from '@portfolio/contracts';
import { api, ClientApiError } from '@/lib/client-api';

type MilestoneForm = {
  title: string;
  description: string;
  date: string;
  type: string;
  visible: boolean;
  sortOrder: number;
  mediaAssetId: string | null;
};

function createEmptyMilestone(): MilestoneForm {
  return {
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'LEARNING',
    visible: true,
    sortOrder: 0,
    mediaAssetId: null,
  };
}

export function MilestonesManager({ initial }: { initial: MilestoneDto[] }) {
  const [items, setItems] = useState(initial);
  const [media, setMedia] = useState<MediaAssetDto[]>([]);
  const [form, setForm] = useState<MilestoneForm>(createEmptyMilestone);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void api<MediaAssetDto[]>('/admin/media')
      .then(setMedia)
      .catch(() => undefined);
  }, []);

  function patch<K extends keyof MilestoneForm>(key: K, value: MilestoneForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    clearFeedback();
    const payload = {
      ...form,
      date: new Date(form.date).toISOString(),
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (editingId) {
        const updated = await api<MilestoneDto>(`/admin/milestones/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setItems((current) => current.map((item) => (item.id === editingId ? updated : item)));
        setMessage('Milestone updated.');
      } else {
        const created = await api<MilestoneDto>('/admin/milestones', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setItems((current) => [...current, created]);
        setMessage('Milestone created.');
      }

      setEditingId(null);
      setForm(createEmptyMilestone());
    } catch (cause) {
      setError(apiMessage(cause, 'Could not save milestone.'));
    } finally {
      setBusy(false);
    }
  }

  function edit(item: MilestoneDto) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      date: item.date.slice(0, 10),
      type: item.type,
      visible: item.visible,
      sortOrder: item.sortOrder,
      mediaAssetId: item.mediaAsset?.id ?? null,
    });
  }

  async function remove(id: string) {
    if (!window.confirm('Delete milestone?')) return;
    setBusy(true);
    clearFeedback();
    try {
      await api(`/admin/milestones/${id}`, { method: 'DELETE' });
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage('Milestone deleted.');
    } catch (cause) {
      setError(apiMessage(cause, 'Could not delete milestone.'));
    } finally {
      setBusy(false);
    }
  }

  async function move(item: MilestoneDto, direction: -1 | 1) {
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
      await api('/admin/milestones/order', {
        method: 'PUT',
        body: JSON.stringify({ milestoneIds: next.map((candidate) => candidate.id) }),
      });
      setMessage('Journey order updated.');
    } catch (cause) {
      setItems(previous);
      setError(apiMessage(cause, 'Could not reorder milestones.'));
    } finally {
      setBusy(false);
    }
  }

  function clearFeedback() {
    setMessage('');
    setError('');
  }

  return (
    <div className="admin-split">
      <form className="admin-panel admin-form" onSubmit={submit}>
        <div className="panel-title">
          <h2>{editingId ? 'Edit milestone' : 'New milestone'}</h2>
        </div>

        <label>
          Title
          <input
            value={form.title}
            onChange={(event) => patch('title', event.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea
            rows={5}
            value={form.description}
            onChange={(event) => patch('description', event.target.value)}
            required
          />
        </label>

        <div className="form-grid two">
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => patch('date', event.target.value)}
              required
            />
          </label>
          <label>
            Type
            <input
              value={form.type}
              onChange={(event) => patch('type', event.target.value)}
              required
            />
          </label>
          <label>
            Media (optional)
            <select
              value={form.mediaAssetId ?? ''}
              onChange={(event) => patch('mediaAssetId', event.target.value || null)}
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
              onChange={(event) => patch('sortOrder', Number(event.target.value))}
            />
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(event) => patch('visible', event.target.checked)}
            />
            Visible publicly
          </label>
        </div>

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
                setForm(createEmptyMilestone());
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
        <div className="panel-title">
          <h2>Journey entries</h2>
        </div>
        {[...items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item, index, ordered) => (
            <article key={item.id}>
              <div>
                <small>
                  {new Date(item.date).toLocaleDateString()} · {item.type}
                </small>
                <strong>{item.title}</strong>
                <span className={`status ${item.visible ? 'published' : 'draft'}`}>
                  {item.visible ? 'VISIBLE' : 'HIDDEN'}
                </span>
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
