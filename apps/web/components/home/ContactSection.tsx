import type { SettingsMap } from '@portfolio/contracts';
import { SectionLabel } from '@/components/SectionLabel';
import { Stickman } from '@/components/Stickman';
import { StorySection } from '@/components/motion/StorySection';
import { textSetting } from '@/lib/settings';

const socialLinks = [
  ['githubUrl', 'github'],
  ['upworkUrl', 'upwork'],
  ['linkedinUrl', 'linkedin'],
] as const;

export function ContactSection({ settings }: { settings: SettingsMap }) {
  const email = textSetting(settings, 'contactEmail', 'hello@example.com');

  return (
    <StorySection className="contact-scene section-cream" id="story-contact" story="contact">
      <SectionLabel>SAY HELLO</SectionLabel>
      <div>
        <div className="contact-inner">
          {/* Celebrate above the invite — arms up frame the headline */}
          <Stickman pose="celebrate" />
          <p className="hand-note">still here?</p>
          <h2 data-story-heading>
            have something
            <br />
            interesting in mind?
          </h2>
          <a className="contact-email" href={`mailto:${email}`}>
            {email}
          </a>
          <div className="socials">
            {socialLinks.map(([key, label]) => {
              const href = textSetting(settings, key);
              return href ? (
                <a key={key} href={href} target="_blank" rel="noreferrer">
                  {label}
                </a>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </StorySection>
  );
}
