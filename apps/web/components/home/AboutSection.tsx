import Link from 'next/link';
import type { SettingsMap } from '@portfolio/contracts';
import { SectionLabel } from '@/components/SectionLabel';
import { Stickman } from '@/components/Stickman';
import { StorySection } from '@/components/motion/StorySection';
import { textSetting } from '@/lib/settings';

export function AboutSection({ settings }: { settings: SettingsMap }) {
  return (
    <StorySection className="section-cream" id="story-about" story="about">
      <SectionLabel>ABOUT</SectionLabel>
      <div>
        <div className="about-statement">
          <p>somewhere between</p>
          <strong>FIGMA</strong>
          <span className="amp">&amp;</span>
          <strong>VS CODE.</strong>
          <Stickman pose="think" />
        </div>
        <div className="about-bottom">
          <p>
            {textSetting(
              settings,
              'ownerBio',
              'I like making useful things feel a little more human.',
            )}
          </p>
          <Link className="text-link" href="/about">
            a little more about me ↗
          </Link>
        </div>
      </div>
    </StorySection>
  );
}
