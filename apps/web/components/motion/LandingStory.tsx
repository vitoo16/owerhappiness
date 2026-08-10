'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from './storyGsap';

const chapters = [
  { id: 'story-hero', label: 'intro' },
  { id: 'story-about', label: 'about' },
  { id: 'story-work', label: 'work' },
  { id: 'story-journey', label: 'journey' },
  { id: 'story-playground', label: 'play' },
  { id: 'story-contact', label: 'hello' },
] as const;

type StoryName = 'hero' | 'about' | 'work' | 'journey' | 'playground' | 'contact';

interface MotionConditions {
  isDesktop: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
}

interface HeadingMotion {
  instances: Array<{ revert: () => void }>;
  lines: Record<'journey' | 'playground' | 'contact', HTMLElement[]>;
}

export function LandingStory({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add(
        {
          isDesktop: '(min-width: 901px)',
          isMobile: '(max-width: 900px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const conditions = context.conditions as unknown as MotionConditions;
          const scenes = gsap.utils.toArray<HTMLElement>('[data-story-section]', element);

          if (conditions.isDesktop) {
            buildStoryProgress(element, scenes);
          }

          if (conditions.reduceMotion) {
            buildReducedStory(scenes);
            return;
          }

          const headings = createHeadingMotion(element);

          buildHeroToAbout(element, conditions);
          buildAboutToWork(element, conditions);
          buildWorkStory(element, conditions);
          buildWorkToJourney(element, conditions, headings.lines.journey);
          buildJourneyToPlayground(element, conditions, headings.lines.playground);
          buildPlaygroundToContact(element, conditions, headings.lines.contact);

          return () => {
            headings.instances.reverse().forEach((instance) => instance.revert());
          };
        },
      );

      return () => media.revert();
    },
    { scope: root },
  );

  const goToChapter = contextSafe((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.scrollIntoView();
      return;
    }

    const targetY = gsap.utils.clamp(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
      window.scrollY + target.getBoundingClientRect().top - 68,
    );

    gsap.to(window, {
      duration: 1,
      ease: 'power3.inOut',
      overwrite: true,
      scrollTo: { y: targetY, autoKill: false },
      onComplete: () => {
        const settledY = window.scrollY + target.getBoundingClientRect().top - 68;
        if (Math.abs(settledY - window.scrollY) < 2) return;

        gsap.to(window, {
          duration: 0.22,
          ease: 'power2.out',
          overwrite: 'auto',
          scrollTo: { y: settledY, autoKill: false },
        });
      },
    });
  });

  return (
    <div className="landing-story" ref={root}>
      <nav className="story-progress" aria-label="Homepage chapters">
        <span className="story-progress-track" aria-hidden>
          <i data-story-progress />
        </span>
        <ol>
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <button
                type="button"
                className={index === 0 ? 'active' : ''}
                data-story-chapter={chapter.id}
                onClick={() => goToChapter(chapter.id)}
                aria-current={index === 0 ? 'step' : undefined}
                aria-label={`Go to ${chapter.label}`}
              >
                <span className="story-progress-marker" aria-hidden />
                <em>{chapter.label}</em>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      {children}
    </div>
  );
}

function buildStoryProgress(
  root: HTMLElement,
  scenes: HTMLElement[],
) {
  scenes.forEach((scene, index) => {
    ScrollTrigger.create({
      id: `story-chapter-${scene.dataset.story ?? index}`,
      trigger: scene,
      start: 'top 52%',
      end: 'bottom 52%',
      refreshPriority: index,
      onEnter: () => setActiveProgress(root, scene.id),
      onEnterBack: () => setActiveProgress(root, scene.id),
    });
  });

  const progress = root.querySelector<HTMLElement>('[data-story-progress]');
  if (!progress) return;

  gsap.fromTo(
    progress,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        id: 'story-progress-thread',
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.25,
      },
    },
  );
}

function setActiveProgress(root: HTMLElement, chapterId: string) {
  all<HTMLButtonElement>(root, '[data-story-chapter]').forEach((button) => {
    const active = button.dataset.storyChapter === chapterId;
    button.classList.toggle('active', active);

    if (active) {
      button.setAttribute('aria-current', 'step');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function createHeadingMotion(root: HTMLElement): HeadingMotion {
  const instances: Array<{ revert: () => void }> = [];
  const lines = {
    journey: [] as HTMLElement[],
    playground: [] as HTMLElement[],
    contact: [] as HTMLElement[],
  };

  (Object.keys(lines) as Array<keyof typeof lines>).forEach((story) => {
    const heading = root.querySelector<HTMLElement>(
      `[data-story="${story}"] [data-story-heading]`,
    );
    if (!heading) return;

    const split = SplitText.create(heading, {
      aria: 'auto',
      linesClass: 'story-motion-line',
      mask: 'lines',
      type: 'lines',
    });
    instances.push(split);
    lines[story] = split.lines as HTMLElement[];
    gsap.set(lines[story], {
      autoAlpha: 0,
      rotationX: -60,
      transformOrigin: '50% 100%',
      transformPerspective: 1000,
    });
  });

  return { instances, lines };
}

function createHandoff(
  root: HTMLElement,
  story: Exclude<StoryName, 'hero'>,
  conditions: MotionConditions,
  refreshPriority: number,
) {
  const scene = root.querySelector<HTMLElement>(`[data-story="${story}"]`);
  if (!scene) return null;

  const timeline = gsap.timeline({
    defaults: {
      duration: 0.42,
      ease: conditions.isDesktop ? 'none' : 'power3.out',
      overwrite: 'auto',
    },
    onStart: () => {
      scene.dataset.storyState = 'exchanging';
    },
    onComplete: () => {
      scene.dataset.storyState = 'settled';
    },
    onReverseComplete: () => {
      scene.dataset.storyState = 'prepared';
    },
    scrollTrigger: {
      id: `story-handoff-${story}`,
      trigger: scene,
      start: conditions.isDesktop ? 'clamp(top 94%)' : 'top 90%',
      end: conditions.isDesktop ? 'clamp(top 18%)' : 'top 58%',
      ...(conditions.isDesktop
        ? { scrub: 0.58 }
        : { toggleActions: 'play none none reverse' }),
      invalidateOnRefresh: true,
      refreshPriority,
    },
  });

  timeline
    .addLabel('anticipate', 0)
    .addLabel('exchange', 0.24)
    .addLabel('resolve', 0.7);

  const edge = scene.querySelector<HTMLElement>('[data-story-edge]');
  if (edge) {
    timeline.fromTo(
      edge,
      { scaleX: 0, transformOrigin: '50% 50%' },
      { scaleX: 1, duration: 0.4 },
      'exchange',
    );
  }

  return timeline;
}

function buildHeroToAbout(root: HTMLElement, conditions: MotionConditions) {
  const timeline = createHandoff(root, 'about', conditions, 10);
  if (!timeline) return;

  const hero = getScene(root, 'hero');
  const about = getScene(root, 'about');
  if (!hero || !about) return;

  const motion = conditions.isDesktop ? 1 : 0.55;
  const heroLines = all<HTMLElement>(hero, '[data-hero="line"]');
  const heroSupport = all<HTMLElement>(hero, '[data-hero="support"], [data-hero="eyebrow"]');
  const heroMascot = one<HTMLElement>(hero, '.hero-character');
  const scrollHint = one<HTMLElement>(hero, '.scroll-hint');
  const aboutLabel = one<HTMLElement>(about, '.section-label');
  const aboutLead = one<HTMLElement>(about, '.about-statement > p');
  const aboutWords = all<HTMLElement>(about, '.about-statement strong');
  const ampersand = one<HTMLElement>(about, '.about-statement .amp');
  const aboutMascot = one<HTMLElement>(about, '.about-statement .stickman');
  const aboutBottom = one<HTMLElement>(about, '.about-bottom');

  if (aboutWords.length) {
    gsap.set(aboutWords, {
      autoAlpha: 0.18,
      xPercent: (index) => (index === 0 ? -20 : 20) * motion,
    });
  }

  if (scrollHint) {
    timeline.to(scrollHint, { autoAlpha: 0, scaleY: 0.6, duration: 0.2 }, 'anticipate');
  }
  if (heroLines[0]) {
    timeline.to(
      heroLines[0],
      { autoAlpha: 0.18, xPercent: -10 * motion, duration: 0.56 },
      'anticipate',
    );
  }
  if (heroLines[1]) {
    timeline.to(
      heroLines[1],
      { autoAlpha: 0.18, xPercent: 12 * motion, duration: 0.56 },
      'anticipate',
    );
  }
  if (heroSupport.length) {
    timeline.to(heroSupport, { autoAlpha: 0.08, duration: 0.36 }, 'anticipate+=0.05');
  }
  if (aboutLabel) {
    timeline.fromTo(
      aboutLabel,
      { autoAlpha: 0, scaleX: 0.72, transformOrigin: '0% 50%' },
      { autoAlpha: 1, scaleX: 1, duration: 0.38 },
      'exchange',
    );
  }
  if (aboutLead) {
    timeline.fromTo(
      aboutLead,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3 },
      'exchange+=0.06',
    );
  }
  if (aboutWords.length) {
    timeline.to(
      aboutWords,
      {
        autoAlpha: 1,
        xPercent: 0,
        duration: 0.5,
        stagger: 0.04,
      },
      'exchange+=0.08',
    );
  }
  if (ampersand) {
    timeline.fromTo(
      ampersand,
      { autoAlpha: 0, rotation: -72, scale: 0.16 },
      { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.42 },
      'exchange+=0.18',
    );
  }
  if (heroMascot) {
    timeline.to(
      heroMascot,
      {
        autoAlpha: 0,
        rotation: 7 * motion,
        scale: 0.9,
        duration: 0.44,
      },
      'exchange+=0.05',
    );
  }
  if (aboutMascot) {
    timeline.fromTo(
      aboutMascot,
      { autoAlpha: 0, rotation: -9, scale: 0.82 },
      { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.42 },
      'resolve-=0.08',
    );
  }
  if (aboutBottom) {
    timeline.fromTo(
      aboutBottom,
      { autoAlpha: 0, scale: 0.985 },
      { autoAlpha: 1, scale: 1, duration: 0.38 },
      'resolve',
    );
  }
}

function buildAboutToWork(root: HTMLElement, conditions: MotionConditions) {
  const timeline = createHandoff(root, 'work', conditions, 20);
  if (!timeline) return;

  const about = getScene(root, 'about');
  const work = getScene(root, 'work');
  if (!about || !work) return;

  const motion = conditions.isDesktop ? 1 : 0.55;
  const aboutWords = all<HTMLElement>(about, '.about-statement strong');
  const aboutBottom = one<HTMLElement>(about, '.about-bottom');
  const aboutMascot = one<HTMLElement>(about, '.about-statement .stickman');
  const ampersand = one<HTMLElement>(about, '.about-statement .amp');
  const workLabel = one<HTMLElement>(work, '.section-label');
  const firstProject = one<HTMLElement>(work, '.project-editorial:first-child');
  const visual = firstProject ? one<HTMLElement>(firstProject, '.project-visual') : null;
  const visualSubject = visual
    ? one<HTMLElement>(visual, 'img, .project-placeholder .stickman')
    : null;
  const projectPieces = firstProject
    ? all<HTMLElement>(
        firstProject,
        '.project-index, .project-meta, .project-copy h3, .project-copy > p, .tags, .project-copy > .text-link',
      )
    : [];
  const emptyCopy = one<HTMLElement>(work, '.empty-copy');

  if (projectPieces.length) {
    gsap.set(projectPieces, {
      autoAlpha: 0,
      rotationX: -18 * motion,
      transformOrigin: '50% 100%',
      transformPerspective: 900,
    });
  }

  if (aboutWords.length) {
    timeline.to(
      aboutWords,
      {
        autoAlpha: 0.12,
        xPercent: (index) => (index === 0 ? -22 : 22) * motion,
        duration: 0.48,
      },
      'anticipate',
    );
  }
  if (aboutBottom) {
    timeline.to(aboutBottom, { autoAlpha: 0, scaleX: 0.92, duration: 0.3 }, 'anticipate');
  }
  if (aboutMascot) {
    timeline.to(aboutMascot, { autoAlpha: 0, rotation: 9, duration: 0.28 }, 'anticipate');
  }
  if (ampersand) {
    timeline.to(
      ampersand,
      { autoAlpha: 0, rotation: 90, scale: 0.35, duration: 0.3 },
      'anticipate+=0.05',
    );
  }
  if (workLabel) {
    timeline.fromTo(
      workLabel,
      { autoAlpha: 0, scaleX: 0.7, transformOrigin: '0% 50%' },
      { autoAlpha: 1, scaleX: 1, duration: 0.36 },
      'exchange',
    );
  }
  if (visual) {
    timeline.fromTo(
      visual,
      { clipPath: 'inset(0 49% 0 49%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.62 },
      'exchange',
    );
  }
  if (visualSubject) {
    timeline.fromTo(
      visualSubject,
      { scale: 1.075 },
      { scale: 1, duration: 0.62 },
      'exchange',
    );
  }
  if (projectPieces.length) {
    timeline.to(
      projectPieces,
      {
        autoAlpha: 1,
        rotationX: 0,
        duration: 0.34,
        stagger: 0.045,
      },
      'resolve-=0.08',
    );
  } else if (emptyCopy) {
    timeline.fromTo(emptyCopy, { autoAlpha: 0 }, { autoAlpha: 1 }, 'resolve');
  }
}

function buildWorkStory(root: HTMLElement, conditions: MotionConditions) {
  const work = getScene(root, 'work');
  if (!work) return;

  const projects = all<HTMLElement>(work, '.project-editorial');
  projects.slice(1).forEach((project, offset) => {
    const visual = one<HTMLElement>(project, '.project-visual');
    const visualSubject = visual
      ? one<HTMLElement>(visual, 'img, .project-placeholder .stickman')
      : null;
    const pieces = all<HTMLElement>(
      project,
      '.project-index, .project-meta, .project-copy h3, .project-copy > p, .tags, .project-copy > .text-link',
    );
    const timeline = gsap.timeline({
      defaults: {
        duration: 0.48,
        ease: conditions.isDesktop ? 'none' : 'power3.out',
        overwrite: 'auto',
      },
      scrollTrigger: {
        id: `story-work-project-${offset + 2}`,
        trigger: project,
        start: conditions.isDesktop ? 'top 88%' : 'top 86%',
        end: conditions.isDesktop ? 'center 44%' : 'top 58%',
        ...(conditions.isDesktop
          ? { scrub: 0.48 }
          : { toggleActions: 'play none none reverse' }),
        invalidateOnRefresh: true,
        refreshPriority: 21 + offset,
      },
    });

    if (pieces.length) {
      gsap.set(pieces, {
        autoAlpha: 0,
        rotationX: -16,
        transformOrigin: '50% 100%',
        transformPerspective: 900,
      });
    }

    timeline.addLabel('frame', 0).addLabel('proof', 0.22);
    if (visualSubject) {
      timeline.fromTo(
        visualSubject,
        { autoAlpha: 0.38, scale: 1.055 },
        { autoAlpha: 1, scale: 1, duration: 0.58 },
        'frame',
      );
    }
    if (pieces.length) {
      timeline.to(
        pieces,
        {
          autoAlpha: 1,
          rotationX: 0,
          stagger: 0.04,
          duration: 0.34,
        },
        'proof',
      );
    }
  });
}

function buildWorkToJourney(
  root: HTMLElement,
  conditions: MotionConditions,
  journeyLines: HTMLElement[],
) {
  const timeline = createHandoff(root, 'journey', conditions, 30);
  if (!timeline) return;

  const work = getScene(root, 'work');
  const journey = getScene(root, 'journey');
  if (!work || !journey) return;

  const projects = all<HTMLElement>(work, '.project-editorial');
  const lastProject = projects.at(-1) ?? null;
  const lastVisual = lastProject ? one<HTMLElement>(lastProject, '.project-visual') : null;
  const lastCopy = lastProject ? one<HTMLElement>(lastProject, '.project-copy') : null;
  const lastIndex = lastProject ? one<HTMLElement>(lastProject, '.project-index') : null;
  const workLink = one<HTMLElement>(work, '.section-link');
  const journeyLabel = one<HTMLElement>(journey, '.section-label');
  const journeyHeading = one<HTMLElement>(journey, '[data-story-heading]');
  const lines = journeyLines.length ? journeyLines : journeyHeading ? [journeyHeading] : [];
  const journeyAside = one<HTMLElement>(journey, '.section-intro > p');
  const journeyShell = one<HTMLElement>(journey, '.lazy-journey-shell');

  if (lastCopy) {
    timeline.to(lastCopy, { autoAlpha: 0.08, rotationX: 12, duration: 0.34 }, 'anticipate');
  }
  if (lastIndex) {
    timeline.to(lastIndex, { autoAlpha: 0, scale: 0.7, duration: 0.28 }, 'anticipate');
  }
  if (workLink) {
    timeline.to(workLink, { autoAlpha: 0, scaleX: 0.72, duration: 0.28 }, 'anticipate');
  }
  if (lastVisual) {
    timeline.to(
      lastVisual,
      {
        autoAlpha: 0.28,
        scaleX: 0.035,
        transformOrigin: '100% 50%',
        duration: 0.56,
      },
      'anticipate+=0.04',
    );
  }
  if (journeyLabel) {
    timeline.fromTo(
      journeyLabel,
      { autoAlpha: 0, scaleX: 0.12, transformOrigin: '0% 50%' },
      { autoAlpha: 1, scaleX: 1, duration: 0.42 },
      'exchange',
    );
  }
  if (lines.length) {
    timeline.to(
      lines,
      {
        autoAlpha: 1,
        rotationX: 0,
        duration: 0.5,
        stagger: 0.08,
      },
      'exchange+=0.06',
    );
  }
  if (journeyAside) {
    timeline.fromTo(
      journeyAside,
      { autoAlpha: 0, scale: 0.96 },
      { autoAlpha: 1, scale: 1, duration: 0.34 },
      'resolve-=0.08',
    );
  }
  if (journeyShell) {
    timeline.fromTo(
      journeyShell,
      { autoAlpha: 0.3 },
      { autoAlpha: 1, duration: 0.4 },
      'resolve',
    );
  }
}

function buildJourneyToPlayground(
  root: HTMLElement,
  conditions: MotionConditions,
  playgroundLines: HTMLElement[],
) {
  const timeline = createHandoff(root, 'playground', conditions, 40);
  if (!timeline) return;

  const journey = getScene(root, 'journey');
  const playground = getScene(root, 'playground');
  if (!journey || !playground) return;

  const journeyIntro = one<HTMLElement>(journey, '.section-intro');
  const journeyShell = one<HTMLElement>(journey, '.lazy-journey-shell');
  const journeyLink = one<HTMLElement>(journey, '.section-link');
  const playgroundLabel = one<HTMLElement>(playground, '.section-label');
  const playgroundHeading = one<HTMLElement>(playground, '[data-story-heading]');
  const lines = playgroundLines.length
    ? playgroundLines
    : playgroundHeading
      ? [playgroundHeading]
      : [];
  const playgroundMascot = one<HTMLElement>(playground, '.section-intro .stickman');
  const rows = all<HTMLElement>(playground, '.play-row');
  const rowFan = gsap.utils.distribute({
    base: -0.8,
    amount: 1.6,
    ease: 'power1.inOut',
    from: 'start',
  });
  const rowSide = gsap.utils.wrap([-1, 1]);

  if (rows.length) {
    gsap.set(rows, {
      autoAlpha: 0,
      rotationX: (index) => -62 + rowSide(index) * 5,
      rotationZ: rowFan,
      transformOrigin: (index) => (rowSide(index) < 0 ? '0% 100%' : '100% 100%'),
      transformPerspective: 1100,
    });
  }

  if (journeyIntro) {
    timeline.to(
      journeyIntro,
      { autoAlpha: 0.12, rotationX: 18, transformPerspective: 1000, duration: 0.4 },
      'anticipate',
    );
  }
  if (journeyLink) {
    timeline.to(journeyLink, { autoAlpha: 0, scaleX: 0.72, duration: 0.3 }, 'anticipate');
  }
  if (journeyShell) {
    timeline.to(journeyShell, { autoAlpha: 0.3, duration: 0.5 }, 'anticipate+=0.08');
  }
  if (playgroundLabel) {
    timeline.fromTo(
      playgroundLabel,
      { autoAlpha: 0, scaleX: 0.12, transformOrigin: '0% 50%' },
      { autoAlpha: 1, scaleX: 1, duration: 0.4 },
      'exchange',
    );
  }
  if (lines.length) {
    timeline.to(
      lines,
      {
        autoAlpha: 1,
        rotationX: 0,
        duration: 0.48,
        stagger: 0.075,
      },
      'exchange+=0.06',
    );
  }
  if (playgroundMascot) {
    timeline.fromTo(
      playgroundMascot,
      { autoAlpha: 0, rotation: -12, scale: 0.78 },
      { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.4 },
      'exchange+=0.18',
    );
  }
  if (rows.length) {
    timeline.to(
      rows,
      {
        autoAlpha: 1,
        rotationX: 0,
        rotationZ: 0,
        duration: 0.48,
        stagger: { amount: 0.26, from: 'start' },
      },
      'resolve-=0.1',
    );
  }
}

function buildPlaygroundToContact(
  root: HTMLElement,
  conditions: MotionConditions,
  contactLines: HTMLElement[],
) {
  const timeline = createHandoff(root, 'contact', conditions, 50);
  if (!timeline) return;

  const playground = getScene(root, 'playground');
  const contact = getScene(root, 'contact');
  if (!playground || !contact) return;

  const rows = all<HTMLElement>(playground, '.play-row');
  const playgroundIntro = one<HTMLElement>(playground, '.section-intro');
  const playgroundLabel = one<HTMLElement>(playground, '.section-label');
  const playgroundLink = one<HTMLElement>(playground, '.section-link');
  const contactLabel = one<HTMLElement>(contact, '.section-label');
  const contactHeading = one<HTMLElement>(contact, '[data-story-heading]');
  const lines = contactLines.length ? contactLines : contactHeading ? [contactHeading] : [];
  const mascot = one<HTMLElement>(contact, '.contact-inner .stickman');
  const mascotStrokes = mascot ? all<SVGPathElement>(mascot, 'path') : [];
  const note = one<HTMLElement>(contact, '.contact-inner .hand-note');
  const email = one<HTMLElement>(contact, '.contact-email');
  const socials = all<HTMLElement>(contact, '.socials a');

  if (mascotStrokes.length) {
    gsap.set(mascotStrokes, { drawSVG: '0% 0%' });
  }
  if (socials.length) {
    gsap.set(socials, { autoAlpha: 0, rotationX: -35, transformPerspective: 800 });
  }

  if (rows.length) {
    timeline.to(
      rows,
      {
        autoAlpha: 0.08,
        rotationX: 72,
        scaleY: 0.86,
        transformOrigin: '50% 50%',
        transformPerspective: 1000,
        duration: 0.44,
        stagger: { amount: 0.24, from: 'edges' },
      },
      'anticipate',
    );
  }
  if (playgroundIntro) {
    timeline.to(playgroundIntro, { autoAlpha: 0.1, scale: 0.96, duration: 0.36 }, 'anticipate');
  }
  if (playgroundLabel) {
    timeline.to(playgroundLabel, { autoAlpha: 0, scaleX: 0.4, duration: 0.3 }, 'anticipate');
  }
  if (playgroundLink) {
    timeline.to(playgroundLink, { autoAlpha: 0, scaleX: 0.4, duration: 0.3 }, 'anticipate');
  }
  if (contactLabel) {
    timeline.fromTo(
      contactLabel,
      { autoAlpha: 0, scaleX: 0.1, transformOrigin: '50% 50%' },
      { autoAlpha: 1, scaleX: 1, duration: 0.38 },
      'exchange',
    );
  }
  if (mascot) {
    timeline.fromTo(
      mascot,
      { autoAlpha: 0, rotation: -7, scale: 0.82 },
      { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.42 },
      'exchange+=0.05',
    );
  }
  if (mascotStrokes.length) {
    timeline.to(
      mascotStrokes,
      {
        drawSVG: '0% 100%',
        duration: 0.42,
        stagger: { amount: 0.26, from: 'start' },
      },
      'exchange+=0.08',
    );
  }
  if (note) {
    timeline.fromTo(
      note,
      { autoAlpha: 0, rotation: -8, scale: 0.86 },
      { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.3 },
      'exchange+=0.2',
    );
  }
  if (lines.length) {
    timeline.to(
      lines,
      {
        autoAlpha: 1,
        rotationX: 0,
        duration: 0.46,
        stagger: 0.07,
      },
      'resolve-=0.14',
    );
  }
  if (email) {
    timeline.fromTo(
      email,
      { '--contact-line': 0, autoAlpha: 0, scale: 0.97 },
      { '--contact-line': 1, autoAlpha: 1, scale: 1, duration: 0.4 },
      'resolve',
    );
  }
  if (socials.length) {
    timeline.to(
      socials,
      { autoAlpha: 1, rotationX: 0, duration: 0.28, stagger: 0.045 },
      'resolve+=0.08',
    );
  }
}

function buildReducedStory(scenes: HTMLElement[]) {
  scenes.slice(1).forEach((scene, index) => {
    const focalTargets = all<HTMLElement>(
      scene,
      '.section-label, [data-story-heading], .about-statement, .project-editorial:first-child, .contact-inner',
    );
    if (!focalTargets.length) return;

    gsap.fromTo(
      focalTargets,
      { autoAlpha: 0.68, y: 6 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.3,
        ease: 'power1.out',
        stagger: 0.025,
        scrollTrigger: {
          id: `story-reduced-${scene.dataset.story ?? index}`,
          trigger: scene,
          start: 'top 86%',
          toggleActions: 'play none none reverse',
          refreshPriority: 10 + index * 10,
        },
      },
    );
  });
}

function getScene(root: HTMLElement, story: StoryName) {
  return root.querySelector<HTMLElement>(`[data-story="${story}"]`);
}

function one<T extends Element>(root: ParentNode, selector: string) {
  return root.querySelector<T>(selector);
}

function all<T extends Element>(root: Element, selector: string) {
  return gsap.utils.toArray<T>(selector, root);
}
