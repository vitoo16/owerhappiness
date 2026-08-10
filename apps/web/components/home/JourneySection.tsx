import Link from 'next/link';
import type { MilestoneDto } from '@portfolio/contracts';
import { SectionLabel } from '@/components/SectionLabel';
import { LazyJourneyTimeline } from '@/components/motion/LazyJourneyTimeline';
import { StorySection } from '@/components/motion/StorySection';

export function JourneySection({ milestones }: { milestones: MilestoneDto[] }) {
  return (
    <StorySection className="section-blush" id="story-journey" story="journey">
      <SectionLabel>JOURNEY</SectionLabel>
      <div className="section-intro">
        <h2 data-story-heading>
          the little things
          <br />
          that got me here.
        </h2>
        <p>Milestones, tiny wins, and a few detours.</p>
      </div>
      <LazyJourneyTimeline items={milestones.slice(0, 5)} />
      <Link className="section-link" href="/journey">
        see the whole journey →
      </Link>
    </StorySection>
  );
}
