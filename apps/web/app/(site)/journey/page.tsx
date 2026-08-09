import type { MilestoneDto } from '@portfolio/contracts';
import { JourneyTimeline } from '@/components/JourneyTimeline';
import { SectionLabel } from '@/components/SectionLabel';
import { publicApi } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Journey' };

export default async function JourneyPage() {
  const milestones = await publicApi<MilestoneDto[]>('/milestones');

  return (
    <section className="page-shell section-blush">
      <div className="container">
        <SectionLabel index="JOURNEY">MILESTONES</SectionLabel>
        <header className="page-heading">
          <h1>
            still learning.
            <br />
            still making.
          </h1>
          <p>A not-so-straight line through code, design and freelance work.</p>
        </header>
        <JourneyTimeline items={milestones} />
      </div>
    </section>
  );
}
