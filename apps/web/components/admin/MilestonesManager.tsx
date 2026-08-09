'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { MediaAssetDto, MilestoneDto } from '@portfolio/contracts';
import { api } from '@/lib/client-api';

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

  useEffect(() => {
    void api<MediaAssetDto[]>('/admin/media').then(setMedia).catch(() => undefined);
  }, []);

  function patch<K extends keyof MilestoneForm>(key: K, value: MilestoneForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      date: new Date(form.date).toISOString(),
      sortOrder: Number(form.sortOrder),
    };

    if (editingId) {
      const updated = await api<MilestoneDto>(`/admin/milestones/${editingId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setItems((current) => current.map((item) => (item.id === editingId ? updated : item)));
    } else {
      const created = await api<MilestoneDto>('/admin/milestones', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setItems((current) => [...current, created]);
    }

    setEditingId(null);
    setForm(createEmptyMilestone());
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
    await api(`/admin/milestones/${id}`, { method: 'DELETE' });
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="admin-split">
      <form className="admin-panel admin-form" onSubmit={submit}>
        <div className="panel-title">
          <h2>{editingId ? 'Edit milestone' : 'New milestone'}</h2>
        </div>

        <label>
          Title
          <input value={form.title} onChange={(event) => patch('title', event.target.value)} required />
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
            <input value={form.type} onChange={(event) => patch('type', event.target.value)} required />
          </label>
          <label>
            Media (optional)
            <select
              value={form.mediaAssetId ?? ''}
              onChange={(event) => patch('mediaAssetId', event.target.value || null)}
            >
              <option value="">None</option>
              {media.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.originalName}</option>
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
          <button className="button small">{editingId ? 'Save' : 'Create'}</button>
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
      </form>

      <section className="admin-panel resource-list">
        <div className="panel-title"><h2>Journey entries</h2></div>
        {[...items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => (
            <article key={item.id}>
              <div>
                <small>{new Date(item.date).toLocaleDateString()} · {item.type}</small>
                <strong>{item.title}</strong>
                <span className={`status ${item.visible ? 'published' : 'draft'}`}>
                  {item.visible ? 'VISIBLE' : 'HIDDEN'}
                </span>
              </div>
              <div>
                <button type="button" onClick={() => edit(item)}>edit</button>
                <button type="button" className="danger" onClick={() => void remove(item.id)}>delete</button>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}
