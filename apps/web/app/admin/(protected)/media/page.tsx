import type { MediaAssetDto } from '@portfolio/contracts';
import { MediaManager } from '@/components/admin/MediaManager';
import { privateApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  const media = await privateApi<MediaAssetDto[]>('/admin/media');

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">ASSETS</p>
          <h1>Media</h1>
        </div>
      </header>
      <MediaManager initial={media} />
    </div>
  );
}
