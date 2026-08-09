'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsap';

const chapters = [
  { id: 'story-hero', index: '00', label: 'intro' },
  { id: 'story-about', index: '01', label: 'about' },
  { id: 'story-work', index: '02', label: 'work' },
  { id: 'story-journey', index: '03', label: 'journey' },
  { id: 'story-playground', index: '04', label: 'play' },
  { id: 'story-contact', index: '05', label: 'hello' },
] as const;

export function LandingStory({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState<string>(chapters[0].id);
  const { contextSafe } = useGSAP(
    (_, scopedContextSafe) => {
      const element = root.current;
      if (!element) return;

      const scenes = gsap.utils.toArray<HTMLElement>('[data-story-section]');
      scenes.forEach((scene) => {
        const id = scene.id;
        ScrollTrigger.create({
          trigger: scene,
          start: 'top 52%',
          end: 'bottom 52%',
          onEnter: () => setActiveChapter(id),
          onEnterBack: () => setActiveChapter(id),
        });
      });

      const media = gsap.matchMedia();
      media.add(
        {
          isDesktop: '(min-width: 901px)',
          isMobile: '(max-width: 900px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            gsap.set('[data-story-progress]', { scaleY: 1 });
            return;
          }

          const makeContextSafe = scopedContextSafe ?? ((callback: () => void) => callback);

          gsap.fromTo(
            '[data-story-progress]',
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: element,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.25,
              },
            },
          );

          buildSectionTransitions(element, isDesktop);
          buildHeroStory(element, isDesktop);
          buildAboutStory(element, isDesktop);

          queueStoryInitialization(
            element,
            'work',
            makeContextSafe(() => {
              buildWorkStory(element, isDesktop);
              gsap.delayedCall(0, () => ScrollTrigger.refresh());
            }),
            20,
          );
          queueStoryInitialization(
            element,
            'playground',
            makeContextSafe(() => {
              buildPlaygroundStory(element, isDesktop);
              gsap.delayedCall(0, () => ScrollTrigger.refresh());
            }),
            40,
          );
          queueStoryInitialization(
            element,
            'contact',
            makeContextSafe(() => {
              buildContactStory(element, isDesktop);
              gsap.delayedCall(0, () => ScrollTrigger.refresh());
            }),
            50,
          );
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

    gsap.to(window, {
      duration: 1,
      ease: 'power3.inOut',
      overwrite: 'auto',
      scrollTo: { y: target, offsetY: 68 },
    });
  });

  return (
    <div className="landing-story" ref={root}>
      <nav className="story-progress" aria-label="Homepage chapters">
        <span className="story-progress-track" aria-hidden>
          <i data-story-progress />
        </span>
        <ol>
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <button
                type="button"
                className={activeChapter === chapter.id ? 'active' : ''}
                onClick={() => goToChapter(chapter.id)}
                aria-current={activeChapter === chapter.id ? 'step' : undefined}
                aria-label={`Go to ${chapter.label}`}
              >
                <span>{chapter.index}</span>
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

function buildSectionTransitions(root: HTMLElement, isDesktop: boolean) {
  const scenes = [...root.querySelectorAll<HTMLElement>('[data-story-section]')].slice(1);

  scenes.forEach((scene, index) => {
    const surface = scene.querySelector<HTMLElement>(':scope > .container');
    const label = surface?.querySelector<HTMLElement>(':scope > .section-label');
    if (!surface) return;

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene,
        start: 'top 98%',
        end: 'top 58%',
        scrub: isDesktop ? 0.55 : 0.25,
        invalidateOnRefresh: true,
        refreshPriority: index + 1,
      },
    });

    timeline
      .addLabel('section-enter', 0)
      .fromTo(
        surface,
        { autoAlpha: 0.16, y: isDesktop ? 82 : 42 },
        { autoAlpha: 1, y: 0, duration: 1, immediateRender: false },
        'section-enter',
      );

    if (label) {
      timeline.fromTo(
        label,
        { x: isDesktop ? -26 : -12 },
        { x: 0, duration: 0.72, immediateRender: false },
        'section-enter+=0.12',
      );
    }
  });
}

function queueStoryInitialization(
  root: HTMLElement,
  story: string,
  initialize: () => void,
  refreshPriority: number,
) {
  const scene = root.querySelector<HTMLElement>(`[data-story="${story}"]`);
  if (!scene) return;

  let initialized = false;
  const runOnce = () => {
    if (initialized) return;
    initialized = true;
    scene.dataset.motionReady = 'true';
    initialize();
  };

  scene.dataset.motionReady = 'pending';
  ScrollTrigger.create({
    id: `story-loader-${story}`,
    trigger: scene,
    start: 'top 120%',
    end: 'bottom -20%',
    once: true,
    refreshPriority,
    onEnter: runOnce,
    onEnterBack: runOnce,
  });
}

function buildHeroStory(root: HTMLElement, isDesktop: boolean) {
  const scene = root.querySelector<HTMLElement>('[data-story="hero"]');
  if (!scene) return;

  const copy = scene.querySelector<HTMLElement>('.hero-copy');
  const mascot = scene.querySelector<HTMLElement>('.hero-character');
  const scroll = scene.querySelector<HTMLElement>('.scroll-hint');
  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: 'bottom top',
      scrub: isDesktop ? 0.7 : 0.35,
      invalidateOnRefresh: true,
    },
  });

  timeline.addLabel('hero-exit', 0);
  if (copy) {
    timeline.to(
      copy,
      { yPercent: isDesktop ? -18 : -10, autoAlpha: 0.18, overwrite: 'auto' },
      'hero-exit',
    );
  }
  if (mascot) {
    timeline.to(
      mascot,
      {
        xPercent: isDesktop ? -38 : -16,
        yPercent: isDesktop ? 72 : 48,
        rotation: 7,
        scale: isDesktop ? 0.78 : 0.88,
        overwrite: 'auto',
      },
      'hero-exit',
    );
  }
  if (scroll) {
    timeline.to(scroll, { y: 16, autoAlpha: 0, overwrite: 'auto' }, 'hero-exit');
  }
}

function buildAboutStory(root: HTMLElement, isDesktop: boolean) {
  const scene = root.querySelector<HTMLElement>('[data-story="about"]');
  if (!scene) return;

  const words = [...scene.querySelectorAll<HTMLElement>('.about-statement strong')];
  const ampersand = scene.querySelector<HTMLElement>('.about-statement .amp');
  const mascot = scene.querySelector<HTMLElement>('.about-statement .stickman');
  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scene,
      start: 'top 88%',
      end: 'bottom 18%',
      scrub: isDesktop ? 0.85 : 0.4,
      invalidateOnRefresh: true,
    },
  });

  timeline.addLabel('between', 0);
  if (words[0]) {
    timeline.fromTo(
      words[0],
      { xPercent: isDesktop ? -9 : -3 },
      { xPercent: isDesktop ? 3 : 0, duration: 1, immediateRender: false },
      'between',
    );
  }
  if (words[1]) {
    timeline.fromTo(
      words[1],
      { xPercent: isDesktop ? 9 : 3 },
      { xPercent: isDesktop ? -3 : 0, duration: 1, immediateRender: false },
      'between',
    );
  }
  if (ampersand) {
    timeline.fromTo(
      ampersand,
      { rotation: -12, scale: 0.82 },
      { rotation: 5, scale: 1.08, duration: 1, immediateRender: false },
      'between',
    );
  }
  if (mascot) {
    timeline.fromTo(
      mascot,
      { yPercent: 14, rotation: -6 },
      { yPercent: -10, rotation: 4, duration: 1, immediateRender: false },
      'between',
    );
  }
}

function buildWorkStory(root: HTMLElement, isDesktop: boolean) {
  const scene = root.querySelector<HTMLElement>('[data-story="work"]');
  if (!scene) return;

  const projects = [...scene.querySelectorAll<HTMLElement>('.project-editorial')];
  projects.forEach((project, index) => {
    const visual = project.querySelector<HTMLElement>('.project-visual');
    const copy = project.querySelector<HTMLElement>('.project-copy');
    const projectIndex = project.querySelector<HTMLElement>('.project-index');
    const direction = index % 2 === 0 ? 1 : -1;
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: project,
        start: 'top 92%',
        end: 'bottom 12%',
        scrub: isDesktop ? 0.7 : 0.3,
        invalidateOnRefresh: true,
        refreshPriority: 20 + index,
      },
    });

    timeline.addLabel(`project-${index + 1}`, 0);
    if (visual) {
      timeline.fromTo(
        visual,
        { y: isDesktop ? 42 : 18, autoAlpha: 0.28 },
        {
          y: isDesktop ? -34 : -10,
          autoAlpha: 1,
          duration: 1,
          immediateRender: false,
        },
        `project-${index + 1}`,
      );
    }
    if (copy) {
      timeline.fromTo(
        copy,
        { x: isDesktop ? 30 * direction : 0, y: 28, autoAlpha: 0.2 },
        {
          x: 0,
          y: isDesktop ? -16 : -6,
          autoAlpha: 1,
          duration: 1,
          immediateRender: false,
        },
        `project-${index + 1}`,
      );
    }
    if (projectIndex) {
      timeline.fromTo(
        projectIndex,
        { y: 30, autoAlpha: 0.25 },
        { y: -12, autoAlpha: 1, duration: 1, immediateRender: false },
        `project-${index + 1}`,
      );
    }
  });
}

function buildPlaygroundStory(root: HTMLElement, isDesktop: boolean) {
  const scene = root.querySelector<HTMLElement>('[data-story="playground"]');
  if (!scene) return;

  const rows = [...scene.querySelectorAll<HTMLElement>('.play-row')];
  if (!rows.length) return;

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scene,
      start: 'top 82%',
      end: 'bottom 28%',
      scrub: isDesktop ? 0.6 : 0.3,
      refreshPriority: 40,
    },
  });

  timeline.addLabel('lab', 0).fromTo(
    rows,
    { x: (index) => (index % 2 === 0 ? 18 : -18), autoAlpha: 0.45 },
    {
      x: 0,
      autoAlpha: 1,
      stagger: 0.09,
      duration: 0.55,
      immediateRender: false,
    },
    'lab',
  );
}

function buildContactStory(root: HTMLElement, isDesktop: boolean) {
  const scene = root.querySelector<HTMLElement>('[data-story="contact"]');
  if (!scene) return;

  const mascot = scene.querySelector<HTMLElement>('.contact-inner .stickman');
  const note = scene.querySelector<HTMLElement>('.contact-inner .hand-note');
  const heading = scene.querySelector<HTMLElement>('.contact-inner h2');
  const contact = scene.querySelector<HTMLElement>('.contact-email');
  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scene,
      start: 'clamp(top 85%)',
      end: 'clamp(center 45%)',
      scrub: isDesktop ? 0.7 : 0.3,
      refreshPriority: 50,
    },
  });

  timeline.addLabel('hello', 0);
  if (mascot) {
    timeline.fromTo(
      mascot,
      { y: 46, rotation: -8, scale: 0.88 },
      { y: 0, rotation: 3, scale: 1, duration: 1, immediateRender: false },
      'hello',
    );
  }
  if (note) {
    timeline.fromTo(
      note,
      { x: -12, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.55, immediateRender: false },
      'hello+=0.15',
    );
  }
  if (heading) {
    timeline.fromTo(
      heading,
      { y: 30 },
      { y: 0, duration: 0.8, immediateRender: false },
      'hello+=0.12',
    );
  }
  if (contact) {
    timeline.fromTo(
      contact,
      { y: 20, autoAlpha: 0.5 },
      { y: 0, autoAlpha: 1, duration: 0.65, immediateRender: false },
      'hello+=0.3',
    );
  }
}
