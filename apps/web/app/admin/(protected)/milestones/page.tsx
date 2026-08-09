import type { MilestoneDto } from '@portfolio/contracts';
import { MilestonesManager } from '@/components/admin/MilestonesManager';
import { privateApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function AdminMilestonesPage() {
  const items = await privateApi<MilestoneDto[]>('/admin/milestones');

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">JOURNEY</p>
          <h1>Milestones</h1>
        </div>
      </header>
      <MilestonesManager initial={items} />
    </div>
  );
}
