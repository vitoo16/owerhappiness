import type { PlaygroundItemDto } from '@portfolio/contracts';
import { PlaygroundManager } from '@/components/admin/PlaygroundManager';
import { privateApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function AdminPlaygroundPage() {
  const items = await privateApi<PlaygroundItemDto[]>('/admin/playground');

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">LAB</p>
          <h1>Playground</h1>
        </div>
      </header>
      <PlaygroundManager initial={items} />
    </div>
  );
}
