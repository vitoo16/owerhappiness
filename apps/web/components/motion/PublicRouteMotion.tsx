'use client';

import { useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { gsap, ScrollTrigger, SplitText, useGSAP } from './storyGsap';

interface MotionConditions {
  isDesktop: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
}

export function PublicRouteMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const chrome = all<HTMLElement>(
          element,
          '.site-header .brand, .desktop-site-nav > *, .mobile-site-nav > summary',
        ).slice(0, 12);
        if (!chrome.length) return;

        gsap.set(chrome, {
          autoAlpha: 0,
          rotationX: -28,
          transformOrigin: '50% 0%',
          transformPerspective: 800,
        });

        const timeline = gsap.timeline({
          defaults: { duration: 0.5, ease: 'power3.out' },
          onComplete: () => gsap.set(chrome, { clearProps: 'opacity,visibility,transform' }),
        });
        timeline.to(chrome, { autoAlpha: 1, rotationX: 0, stagger: 0.035 });
      });

      return () => media.revert();
    },
    { scope: root },
  );

  useGSAP(
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
          if (conditions.reduceMotion) return;

          const splits: Array<{ revert: () => void }> = [];
          const isHome = Boolean(element.querySelector('.landing-story'));

          if (!isHome) {
            const heading = one<HTMLElement>(
              element,
              'main .page-heading h1, main .about-page-head h1, main .contact-page h1, main .case-title-grid h1',
            );
            const lines = heading ? splitHeading(heading, splits) : [];

            buildPublicEntrance(element, lines);

            if (pathname === '/work') {
              buildWorkPage(element, conditions);
            } else if (pathname === '/about') {
              buildAboutPage(element, conditions);
            } else if (pathname === '/playground') {
              buildPlaygroundPage(element, conditions);
            } else if (pathname.startsWith('/work/')) {
              buildCaseStudy(element, conditions);
            }
          }

          buildFooter(element, conditions);
          const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

          return () => {
            window.cancelAnimationFrame(refreshFrame);
            splits.reverse().forEach((split) => split.revert());
          };
        },
      );

      return () => media.revert();
    },
    { scope: root, dependencies: [routeKey], revertOnUpdate: true },
  );

  return (
    <div className="public-route-motion" ref={root} data-public-route={routeKey}>
      {children}
    </div>
  );
}

function splitHeading(
  heading: HTMLElement,
  instances: Array<{ revert: () => void }>,
) {
  const split = SplitText.create(heading, {
    aria: 'auto',
    linesClass: 'route-motion-line',
    mask: 'lines',
    type: 'lines',
  });
  instances.push(split);
  return split.lines as HTMLElement[];
}

function buildPublicEntrance(root: HTMLElement, headingLines: HTMLElement[]) {
  const label = one<HTMLElement>(
    root,
    'main .page-shell .section-label, main .case-hero > .text-link',
  );
  const support = all<HTMLElement>(
    root,
    [
      'main .page-heading p',
      'main .about-page-head > div > p',
      'main .contact-page .hand-note',
      'main .contact-page > div > p:not(.hand-note)',
      'main .contact-page .contact-email',
      'main .contact-page .socials a',
      'main .case-title-grid p',
      'main .case-links a',
      'main .case-meta > *',
      'main .filter-nav > *',
    ].join(', '),
  ).slice(0, 16);
  const mascot = one<SVGSVGElement>(
    root,
    'main .about-page-head > .stickman, main .split-heading > .stickman, main .contact-page > .stickman, main .case-title-grid > .stickman',
  );
  const contactEmail = one<HTMLElement>(root, 'main .contact-page .contact-email');
  const strokes = mascot ? all<SVGPathElement>(mascot, 'path') : [];
  const entranceTargets = [label, ...headingLines, ...support].filter(
    (target): target is HTMLElement => Boolean(target),
  );

  if (label) {
    gsap.set(label, {
      autoAlpha: 0,
      scaleX: 0.3,
      transformOrigin: '0% 50%',
    });
  }
  if (headingLines.length) {
    gsap.set(headingLines, {
      autoAlpha: 0,
      rotationX: -58,
      transformOrigin: '50% 100%',
      transformPerspective: 1000,
    });
  }
  if (support.length) {
    gsap.set(support, {
      autoAlpha: 0,
      rotationX: -14,
      transformOrigin: '50% 100%',
      transformPerspective: 900,
    });
  }
  if (strokes.length) {
    gsap.set(strokes, { drawSVG: '0% 0%' });
  }
  if (contactEmail) {
    gsap.set(contactEmail, { '--contact-line': 0 });
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      gsap.set(entranceTargets, { clearProps: 'opacity,visibility,transform' });
    },
  });
  timeline.addLabel('label', 0).addLabel('headline', 0.12).addLabel('context', 0.42);

  if (label) {
    timeline.to(label, { autoAlpha: 1, scaleX: 1, duration: 0.46 }, 'label');
  }
  if (headingLines.length) {
    timeline.to(
      headingLines,
      { autoAlpha: 1, rotationX: 0, duration: 0.66, stagger: 0.075 },
      'headline',
    );
  }
  if (strokes.length) {
    timeline.to(
      strokes,
      { drawSVG: '0% 100%', duration: 0.68, stagger: { amount: 0.36, from: 'start' } },
      'headline+=0.08',
    );
  }
  if (support.length) {
    timeline.to(
      support,
      { autoAlpha: 1, rotationX: 0, duration: 0.42, stagger: 0.04 },
      'context',
    );
  }
  if (contactEmail) {
    timeline.to(contactEmail, { '--contact-line': 1, duration: 0.46 }, 'context+=0.08');
  }
}

function buildWorkPage(root: HTMLElement, conditions: MotionConditions) {
  const projects = all<HTMLElement>(root, 'main .page-shell .project-editorial');

  projects.forEach((project, index) => {
    const visual = one<HTMLElement>(project, '.project-visual');
    const subject = visual
      ? one<HTMLElement>(visual, 'img, .project-placeholder .stickman')
      : null;
    const projectIndex = one<HTMLElement>(project, '.project-index');
    const pieces = all<HTMLElement>(
      project,
      '.project-meta, .project-copy h3, .project-copy > p, .tags, .project-copy > .text-link',
    );
    const timeline = createScrollTimeline(
      project,
      conditions,
      `route-work-project-${index + 1}`,
      20 + index,
    );

    if (visual) {
      gsap.set(visual, {
        autoAlpha: 0.28,
        scaleX: 0.78,
        transformOrigin: index % 2 ? '100% 50%' : '0% 50%',
      });
    }
    if (subject) gsap.set(subject, { scale: 1.07 });
    if (projectIndex) gsap.set(projectIndex, { autoAlpha: 0, rotation: -22, scale: 0.55 });
    if (pieces.length) {
      gsap.set(pieces, {
        autoAlpha: 0,
        rotationX: -24,
        transformOrigin: '50% 100%',
        transformPerspective: 900,
      });
    }

    timeline.addLabel('frame', 0).addLabel('proof', 0.38);
    if (visual) {
      timeline.to(visual, { autoAlpha: 1, scaleX: 1, duration: 0.58 }, 'frame');
    }
    if (subject) timeline.to(subject, { scale: 1, duration: 0.62 }, 'frame');
    if (projectIndex) {
      timeline.to(
        projectIndex,
        { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.34 },
        'proof-=0.08',
      );
    }
    if (pieces.length) {
      timeline.to(
        pieces,
        { autoAlpha: 1, rotationX: 0, duration: 0.4, stagger: 0.045 },
        'proof',
      );
    }
  });
}

function buildAboutPage(root: HTMLElement, conditions: MotionConditions) {
  const groups = all<HTMLElement>(root, 'main .skills-grid > section');
  groups.forEach((group, index) => {
    const label = one<HTMLElement>(group, '.eyebrow');
    const skills = all<HTMLElement>(group, 'strong');
    const timeline = createScrollTimeline(
      group,
      conditions,
      `route-about-skills-${index + 1}`,
      20 + index,
    );

    if (label) gsap.set(label, { autoAlpha: 0, scaleX: 0.35, transformOrigin: '0% 50%' });
    if (skills.length) {
      gsap.set(skills, {
        autoAlpha: 0,
        rotationX: -68,
        transformOrigin: '50% 100%',
        transformPerspective: 900,
      });
    }

    if (label) timeline.to(label, { autoAlpha: 1, scaleX: 1, duration: 0.34 }, 0);
    if (skills.length) {
      timeline.to(
        skills,
        { autoAlpha: 1, rotationX: 0, duration: 0.48, stagger: 0.055 },
        0.14,
      );
    }
  });

  const manifesto = one<HTMLElement>(root, 'main .about-manifesto');
  if (!manifesto) return;
  const statements = all<HTMLElement>(manifesto, 'p');
  const timeline = createScrollTimeline(manifesto, conditions, 'route-about-manifesto', 40);
  gsap.set(statements, {
    autoAlpha: 0,
    scaleX: 0.82,
    transformOrigin: (index) => (index % 2 ? '100% 50%' : '0% 50%'),
  });
  timeline.to(statements, { autoAlpha: 1, scaleX: 1, duration: 0.5, stagger: 0.12 });
}

function buildPlaygroundPage(root: HTMLElement, conditions: MotionConditions) {
  const items = all<HTMLElement>(root, 'main .lab-grid > .lab-item');
  const side = gsap.utils.wrap([-1, 1]);

  items.forEach((item, index) => {
    const number = one<HTMLElement>(item, '.lab-number');
    const visual = one<HTMLElement>(item, ':scope > img, .lab-doodle');
    const copy = all<HTMLElement>(item, ':scope > .eyebrow, :scope > h2, :scope > p, .lab-links');
    const strokes = visual ? all<SVGPathElement>(visual, '.stickman path') : [];
    const timeline = createScrollTimeline(
      item,
      conditions,
      `route-playground-item-${index + 1}`,
      20 + index,
    );

    if (number) gsap.set(number, { autoAlpha: 0, rotation: side(index) * 22, scale: 0.6 });
    if (visual) {
      gsap.set(visual, {
        autoAlpha: 0.28,
        rotationY: side(index) * 8,
        scale: 0.965,
        transformPerspective: 1100,
      });
    }
    if (copy.length) {
      gsap.set(copy, {
        autoAlpha: 0,
        rotationX: -22,
        transformOrigin: '50% 100%',
        transformPerspective: 900,
      });
    }
    if (strokes.length) gsap.set(strokes, { drawSVG: '0% 0%' });

    if (number) timeline.to(number, { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.32 }, 0);
    if (visual) {
      timeline.to(visual, { autoAlpha: 1, rotationY: 0, scale: 1, duration: 0.56 }, 0);
    }
    if (strokes.length) {
      timeline.to(
        strokes,
        { drawSVG: '0% 100%', duration: 0.48, stagger: { amount: 0.26, from: 'start' } },
        0.1,
      );
    }
    if (copy.length) {
      timeline.to(
        copy,
        { autoAlpha: 1, rotationX: 0, duration: 0.4, stagger: 0.05 },
        0.34,
      );
    }
  });
}

function buildCaseStudy(root: HTMLElement, conditions: MotionConditions) {
  const cover = one<HTMLElement>(root, 'main .case-cover');
  if (cover) {
    const image = one<HTMLElement>(cover, 'img');
    const timeline = createScrollTimeline(cover, conditions, 'route-case-cover', 10);
    gsap.set(cover, { autoAlpha: 0.25, scaleX: 0.88, transformOrigin: '50% 50%' });
    if (image) gsap.set(image, { scale: 1.055 });
    timeline.to(cover, { autoAlpha: 1, scaleX: 1, duration: 0.62 }, 0);
    if (image) timeline.to(image, { scale: 1, duration: 0.62 }, 0);
  }

  const blocks = all<HTMLElement>(root, 'main .case-study-blocks > *');
  blocks.forEach((block, index) => {
    const visual = one<HTMLElement>(block, 'img, iframe');
    const isEditorialText = block.matches('.case-heading, .case-paragraph, blockquote');
    const timeline = createScrollTimeline(
      block,
      conditions,
      `route-case-block-${index + 1}`,
      20 + index,
    );

    gsap.set(block, {
      autoAlpha: 0.16,
      rotationX: isEditorialText ? -18 : -6,
      scale: isEditorialText ? 0.99 : 0.965,
      transformOrigin: '50% 100%',
      transformPerspective: 1100,
    });
    if (visual) gsap.set(visual, { scale: 1.045 });

    timeline.to(block, { autoAlpha: 1, rotationX: 0, scale: 1, duration: 0.58 }, 0);
    if (visual) timeline.to(visual, { scale: 1, duration: 0.62 }, 0);
  });

  const outro = one<HTMLElement>(root, 'main .case-outro');
  if (!outro) return;
  const copy = all<HTMLElement>(outro, '.hand-note, .case-outro-links, .button');
  const strokes = all<SVGPathElement>(outro, '.stickman path');
  const timeline = createScrollTimeline(outro, conditions, 'route-case-outro', 180);
  gsap.set(copy, { autoAlpha: 0, rotationX: -22, transformPerspective: 900 });
  if (strokes.length) gsap.set(strokes, { drawSVG: '0% 0%' });
  if (strokes.length) {
    timeline.to(
      strokes,
      { drawSVG: '0% 100%', duration: 0.54, stagger: { amount: 0.3, from: 'start' } },
      0,
    );
  }
  timeline.to(copy, { autoAlpha: 1, rotationX: 0, duration: 0.4, stagger: 0.06 }, 0.26);
}

function buildFooter(root: HTMLElement, conditions: MotionConditions) {
  const footer = one<HTMLElement>(root, '.site-footer');
  if (!footer) return;
  const targets = all<HTMLElement>(footer, ':scope > span, :scope > div > *');
  const timeline = createScrollTimeline(footer, conditions, 'route-site-footer', 220);
  gsap.set(targets, {
    autoAlpha: 0,
    rotationX: -28,
    transformOrigin: '50% 100%',
    transformPerspective: 800,
  });
  timeline.to(targets, { autoAlpha: 1, rotationX: 0, duration: 0.42, stagger: 0.055 });
}

function createScrollTimeline(
  trigger: HTMLElement,
  conditions: MotionConditions,
  id: string,
  refreshPriority: number,
) {
  return gsap.timeline({
    defaults: {
      duration: 0.48,
      ease: conditions.isDesktop ? 'none' : 'power3.out',
      overwrite: 'auto',
    },
    scrollTrigger: {
      id,
      trigger,
      start: conditions.isDesktop ? 'clamp(top 90%)' : 'top 88%',
      end: conditions.isDesktop ? 'clamp(center 46%)' : 'top 60%',
      ...(conditions.isDesktop
        ? { scrub: 0.44 }
        : { toggleActions: 'play none none reverse' }),
      invalidateOnRefresh: true,
      refreshPriority,
    },
  });
}

function one<T extends Element>(root: ParentNode, selector: string) {
  return root.querySelector<T>(selector);
}

function all<T extends Element>(root: Element, selector: string) {
  return gsap.utils.toArray<T>(selector, root);
}
