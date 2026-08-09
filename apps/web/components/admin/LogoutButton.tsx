'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <button className="ghost-button" type="button" onClick={() => void logout()}>
      logout
    </button>
  );
}
