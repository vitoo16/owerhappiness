'use client';

import { useState } from 'react';
import { api, ClientApiError } from '@/lib/client-api';

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function logout() {
    setBusy(true);
    setError('');
    try {
      await api('/auth/logout', { method: 'POST' });
      window.location.assign(new URL('/admin/login', window.location.origin).toString());
    } catch (cause) {
      setError(cause instanceof ClientApiError ? cause.message : 'Could not sign out.');
      setBusy(false);
    }
  }

  return (
    <div className="logout-control">
      <button className="ghost-button" type="button" disabled={busy} onClick={() => void logout()}>
        {busy ? 'closing…' : 'logout'}
      </button>
      {error ? (
        <small className="form-error" role="alert">
          {error}
        </small>
      ) : null}
    </div>
  );
}
