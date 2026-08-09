'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ClientApiError } from '@/lib/client-api';

export function useDeskCollection<T>(
  namespace: 'notes' | 'snippets' | 'bookmarks',
  normalize: (value: unknown) => T[],
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api<unknown>(`/desk/data/${namespace}/collection`)
      .then((value) => {
        if (active) setItems(normalize(value));
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof ClientApiError ? cause.message : 'Could not load private data.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [namespace, normalize]);

  const commit = useCallback(
    async (next: T[], successMessage: string) => {
      setBusy(true);
      setError('');
      setMessage('saving…');
      try {
        await api(`/desk/data/${namespace}/collection`, {
          method: 'PUT',
          body: JSON.stringify({ value: next }),
        });
        setItems(next);
        setMessage(successMessage);
        return true;
      } catch (cause) {
        setMessage('');
        setError(cause instanceof ClientApiError ? cause.message : 'Could not save private data.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [namespace],
  );

  return { items, loading, busy, message, error, commit };
}
