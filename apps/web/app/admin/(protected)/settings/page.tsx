import type { SettingsMap } from '@portfolio/contracts';
import { SettingsEditor } from '@/components/admin/SettingsEditor';
import { privateApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await privateApi<SettingsMap>('/admin/settings');

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">GLOBAL CONTENT</p>
          <h1>Site settings</h1>
        </div>
      </header>
      <SettingsEditor initial={settings} />
    </div>
  );
}
