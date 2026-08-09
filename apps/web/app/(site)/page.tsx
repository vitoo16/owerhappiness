import Link from 'next/link';
import type {
  MilestoneDto,
  PlaygroundItemDto,
  ProjectDto,
  SettingsMap,
} from '@portfolio/contracts';
import { HeroMotion } from '@/components/HeroMotion';
import { JourneyTimeline } from '@/components/JourneyTimeline';
import { ProjectEditorialCard } from '@/components/ProjectEditorialCard';
import { Reveal } from '@/components/Reveal';
import { SectionLabel } from '@/components/SectionLabel';
import { Stickman } from '@/components/Stickman';
import { publicApi } from '@/lib/api';
import { getPublicSettings } from '@/lib/server-data';
import { textSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const socialLinks = [
  ['githubUrl', 'github'],
  ['upworkUrl', 'upwork'],
  ['linkedinUrl', 'linkedin'],
] as const;

export default async function HomePage() {
  const [settings, projects, milestones, playground] = await Promise.all([
    getPublicSettings(),
    publicApi<ProjectDto[]>('/projects?limit=6&featured=true'),
    publicApi<MilestoneDto[]>('/milestones'),
    publicApi<PlaygroundItemDto[]>('/playground'),
  ]);

  return (
    <>
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <WorkSection projects={projects} />
      <JourneySection milestones={milestones} />
      <PlaygroundSection items={playground} />
      <ContactSection settings={settings} />
    </>
  );
}

function HeroSection({ settings }: { settings: SettingsMap }) {
  return (
    <section className="hero section-blush">
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

        <div className="scroll-hint">scroll ↓</div>
      </HeroMotion>
    </section>
  );
}

function AboutSection({ settings }: { settings: SettingsMap }) {
  return (
    <section className="section section-cream">
      <div className="container">
        <SectionLabel index="01">ABOUT</SectionLabel>
        <Reveal>
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
        </Reveal>
      </div>
    </section>
  );
}

function WorkSection({ projects }: { projects: ProjectDto[] }) {
  return (
    <section className="section section-paper">
      <div className="container">
        <SectionLabel index="02">SELECTED WORK</SectionLabel>
        <div className="project-list">
          {projects.length ? (
            projects.map((project, index) => (
              <Reveal key={project.id}>
                <ProjectEditorialCard project={project} index={index} />
              </Reveal>
            ))
          ) : (
            <p className="empty-copy">
              No published work yet. The owner can publish projects from Admin.
            </p>
          )}
        </div>
        <Link className="section-link" href="/work">
          view all work →
        </Link>
      </div>
    </section>
  );
}

function JourneySection({ milestones }: { milestones: MilestoneDto[] }) {
  return (
    <section className="section section-blush">
      <div className="container">
        <SectionLabel index="03">JOURNEY</SectionLabel>
        <div className="section-intro">
          <h2>
            the little things
            <br />
            that got me here.
          </h2>
          <p>Milestones, tiny wins, and a few detours.</p>
        </div>
        <JourneyTimeline items={milestones.slice(0, 5)} />
        <Link className="section-link" href="/journey">
          see the whole journey →
        </Link>
      </div>
    </section>
  );
}

function PlaygroundSection({ items }: { items: PlaygroundItemDto[] }) {
  return (
    <section className="section section-peach">
      <div className="container">
        <SectionLabel index="04">PLAYGROUND</SectionLabel>
        <div className="section-intro">
          <h2>
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
      </div>
    </section>
  );
}

function ContactSection({ settings }: { settings: SettingsMap }) {
  const email = textSetting(settings, 'contactEmail', 'hello@example.com');

  return (
    <section className="section contact-scene section-cream">
      <div className="container">
        <SectionLabel index="05">SAY HELLO</SectionLabel>
        <Reveal>
          <div className="contact-inner">
            <Stickman pose="celebrate" />
            <p className="hand-note">still here?</p>
            <h2>
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
        </Reveal>
      </div>
    </section>
  );
}
