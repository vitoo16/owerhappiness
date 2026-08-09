'use client';

import { FormEvent, useState } from 'react';
import type { MediaAssetDto } from '@portfolio/contracts';
import { api, ClientApiError } from '@/lib/client-api';

export function MediaManager({ initial }: { initial: MediaAssetDto[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError('');

    try {
      const created = await api<MediaAssetDto>('/admin/media', {
        method: 'POST',
        body: data,
      });
      setItems((current) => [created, ...current]);
      form.reset();
    } catch (cause) {
      setError(cause instanceof ClientApiError ? cause.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function updateAlt(asset: MediaAssetDto, altText: string) {
    setError('');
    try {
      const updated = await api<MediaAssetDto>(`/admin/media/${asset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ altText }),
      });
      setItems((current) => current.map((item) => (item.id === asset.id ? updated : item)));
    } catch (cause) {
      setError(cause instanceof ClientApiError ? cause.message : 'Could not update alt text.');
    }
  }

  async function remove(asset: MediaAssetDto) {
    if (!window.confirm(`Delete ${asset.originalName}?`)) return;
    setError('');
    try {
      await api(`/admin/media/${asset.id}`, { method: 'DELETE' });
      setItems((current) => current.filter((item) => item.id !== asset.id));
    } catch (cause) {
      setError(cause instanceof ClientApiError ? cause.message : 'Delete failed.');
    }
  }

  return (
    <>
      <form className="admin-panel upload-form" onSubmit={upload}>
        <div>
          <span className="eyebrow">LOCAL STORAGE</span>
          <h2>Upload image</h2>
          <p>JPEG, PNG or WebP. The API validates bytes and normalizes uploads to WebP.</p>
        </div>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Image file"
          required
        />
        <button className="button small" disabled={busy}>
          {busy ? 'uploading…' : 'Upload'}
        </button>
      </form>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="media-grid">
        {items.map((asset) => (
          <article className="media-card" key={asset.id}>
            {/* Admin thumbnails intentionally bypass Next/Image; public delivery uses Next/Image. */}
            <img src={asset.url} alt={asset.altText || ''} loading="lazy" />
            <div>
              <strong>{asset.originalName}</strong>
              <small>
                {asset.width}×{asset.height} · {Math.round(asset.sizeBytes / 1024)} KB · used {asset.usageCount ?? 0}×
              </small>
              <label>
                Alt text
                <input
                  defaultValue={asset.altText}
                  onBlur={(event) => void updateAlt(asset, event.target.value)}
                />
              </label>
              <button
                type="button"
                className="ghost-button danger"
                disabled={!asset.deleteEligible}
                onClick={() => void remove(asset)}
              >
                delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
