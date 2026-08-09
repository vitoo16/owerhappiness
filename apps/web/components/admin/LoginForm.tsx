'use client';

import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ClientApiError } from '@/lib/client-api';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const searchParams = useSearchParams();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const requestedPath = searchParams.get('next');
      const destination = safePrivateDestination(requestedPath);
      window.location.assign(new URL(destination, window.location.origin).toString());
    } catch (caught) {
      setError(caught instanceof ClientApiError ? caught.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-form login-form" onSubmit={submit}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="button" disabled={busy}>
        {busy ? 'opening…' : 'open desk →'}
      </button>
    </form>
  );
}

function safePrivateDestination(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/admin';
  }

  return value === '/desk' ||
    value.startsWith('/desk/') ||
    value === '/admin' ||
    value.startsWith('/admin/')
    ? value
    : '/admin';
}
