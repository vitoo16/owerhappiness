import Link from 'next/link';
import type { PlaygroundItemDto } from '@portfolio/contracts';
import { SectionLabel } from '@/components/SectionLabel';
import { Stickman } from '@/components/Stickman';
import { StorySection } from '@/components/motion/StorySection';

export function PlaygroundSection({ items }: { items: PlaygroundItemDto[] }) {
  return (
    <StorySection className="section-peach" id="story-playground" story="playground">
      <SectionLabel>PLAYGROUND</SectionLabel>
      <div className="section-intro">
        <h2 data-story-heading>
          things nobody
          <br />
          asked me to make.
        </h2>
        <Stickman pose="draw" />
      </div>
      <div className="playground-list">
        {items.slice(0, 6).map((item, index) => (
          <Link href="/playground" key={item.id} className="play-row">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{item.title}</strong>
            <em>{item.type}</em>
            <span>↗</span>
          </Link>
        ))}
      </div>
      <Link className="section-link" href="/playground">
        enter the lab →
      </Link>
    </StorySection>
  );
}
