import Link from 'next/link';
import type { SettingsMap } from '@portfolio/contracts';
import { HeroMotion } from '@/components/HeroMotion';
import { Stickman } from '@/components/Stickman';
import { ScrollDownButton } from '@/components/motion/ScrollDownButton';
import { textSetting } from '@/lib/settings';

export function HeroSection({ settings }: { settings: SettingsMap }) {
  return (
    <div
      className="story-scene story-scene-hero"
      id="story-hero"
      data-story-section
      data-story="hero"
    >
      <section className="hero section-blush story-section story-panel" data-story-panel>
        <HeroMotion>
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow" data-hero="eyebrow">
                {textSetting(settings, 'heroEyebrow', "hello, i'm Thông.")}
              </p>
              <h1>
                <span data-hero="line">
                  {textSetting(settings, 'heroPrimary', 'I DESIGN THINGS.')}
                </span>
                <span data-hero="line">
                  {textSetting(settings, 'heroSecondary', 'I BUILD THINGS.')}
                </span>
              </h1>
              <p className="hero-role" data-hero="support">
                {textSetting(
                  settings,
                  'ownerHeadline',
                  'Designer-ish · Fullstack Developer · Freelancer',
                )}
              </p>
              <div className="hero-actions" data-hero="support">
                <Link className="button" href="/work">
                  see my work <span>↗</span>
                </Link>
                <Link className="text-link" href="/contact">
                  say hello
                </Link>
              </div>
            </div>

            <div className="hero-character" data-hero="mascot">
              <Stickman pose="wave" />
              <span className="hand-note">hi there :)</span>
            </div>
          </div>

          <ScrollDownButton targetId="story-about" />
        </HeroMotion>
      </section>
    </div>
  );
}
