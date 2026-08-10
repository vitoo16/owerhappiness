'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP } from './gsap';

type MotionVariant = 'admin' | 'desk';

const dynamicSelector = [
  '.form-error',
  '.form-success',
  '.table-row',
  '.recent-row',
  '.media-card',
  '.resource-list > article',
  '.block-editor',
  '.note-card',
  '.snippet-card',
  '.bookmark-card',
  '.tool-card',
  '.tool-insight',
  '.match-list',
  '.uuid-list',
  '.collection-empty',
].join(', ');

export function RouteMotion({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: MotionVariant;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        buildWorkspaceChrome(element, variant);
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [variant], revertOnUpdate: true },
  );

  useGSAP(
    (_context, contextSafe) => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (variant === 'admin') {
          buildAdminRoute(element);
        } else {
          buildDeskRoute(element);
        }

        all<HTMLElement>(element, dynamicSelector).forEach((target) => {
          target.dataset.workspaceMotionReady = 'true';
        });

        const animateDynamicTargets = (targets: HTMLElement[]) => {
          if (!targets.length) return;
          gsap.fromTo(
            targets,
            {
              autoAlpha: 0,
              rotationX: -9,
              scale: 0.975,
              transformOrigin: '50% 100%',
              transformPerspective: 900,
            },
            {
              autoAlpha: 1,
              rotationX: 0,
              scale: 1,
              duration: 0.38,
              ease: 'power3.out',
              stagger: 0.035,
              overwrite: 'auto',
              clearProps: 'opacity,visibility,transform',
            },
          );
        };
        const animateDynamic = contextSafe
          ? contextSafe(animateDynamicTargets)
          : animateDynamicTargets;

        const observer = new MutationObserver((records) => {
          const fresh = new Set<HTMLElement>();

          records.forEach((record) => {
            record.addedNodes.forEach((node) => {
              if (!(node instanceof HTMLElement)) return;

              if (node.matches(dynamicSelector)) fresh.add(node);
              node.querySelectorAll<HTMLElement>(dynamicSelector).forEach((target) => {
                fresh.add(target);
              });
            });
          });

          const targets = [...fresh].filter(
            (target) => target.dataset.workspaceMotionReady !== 'true',
          );
          targets.forEach((target) => {
            target.dataset.workspaceMotionReady = 'true';
          });
          animateDynamic(targets);
        });

        observer.observe(element, { childList: true, subtree: true });
        return () => observer.disconnect();
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [pathname, variant], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="route-motion-root" data-motion-variant={variant}>
      {children}
    </div>
  );
}

function buildWorkspaceChrome(root: HTMLElement, variant: MotionVariant) {
  const brand = one<HTMLElement>(
    root,
    variant === 'admin' ? '.admin-sidebar .brand' : '.desk-sidebar .brand',
  );
  const context = all<HTMLElement>(
    root,
    variant === 'admin'
      ? '.admin-caption, .admin-user'
      : '.desk-sidebar > div > p, .desk-account, .desk-header > *',
  );
  const navigation = all<HTMLElement>(
    root,
    variant === 'admin' ? '.admin-sidebar nav > *' : '.desk-nav > *',
  ).slice(0, 12);
  const targets = [brand, ...context, ...navigation].filter(
    (target): target is HTMLElement => Boolean(target),
  );

  if (brand) {
    gsap.set(brand, { autoAlpha: 0, scaleX: 0.35, transformOrigin: '0% 50%' });
  }
  if (context.length) {
    gsap.set(context, {
      autoAlpha: 0,
      rotationX: -18,
      transformOrigin: '50% 100%',
      transformPerspective: 800,
    });
  }
  if (navigation.length) {
    gsap.set(navigation, {
      autoAlpha: 0,
      scaleX: 0.76,
      transformOrigin: '0% 50%',
    });
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      if (targets.length) {
        gsap.set(targets, { clearProps: 'opacity,visibility,transform' });
      }
    },
  });
  if (brand) timeline.to(brand, { autoAlpha: 1, scaleX: 1, duration: 0.46 }, 0);
  if (navigation.length) {
    timeline.to(
      navigation,
      { autoAlpha: 1, scaleX: 1, duration: 0.4, stagger: 0.035 },
      0.12,
    );
  }
  if (context.length) {
    timeline.to(
      context,
      { autoAlpha: 1, rotationX: 0, duration: 0.36, stagger: 0.04 },
      0.24,
    );
  }
}

function buildAdminRoute(root: HTMLElement) {
  const eyebrow = all<HTMLElement>(root, '.admin-main .admin-heading .eyebrow, .login-card .eyebrow');
  const titles = all<HTMLElement>(root, '.admin-main .admin-heading h1, .login-card h1');
  const actions = all<HTMLElement>(
    root,
    '.admin-main .admin-heading .button, .admin-main .admin-heading .ghost-button, .login-form .button',
  );
  const frames = unique(
    all<HTMLElement>(
      root,
      [
        '.admin-main .admin-filters',
        '.admin-main .stat-card',
        '.admin-main .admin-panel',
        '.admin-main .admin-table',
        '.admin-main .admin-empty',
        '.admin-main .project-editor > *',
        '.admin-main .settings-savebar',
        '.admin-main .settings-columns > *',
        '.admin-main .admin-split > *',
        '.admin-main .media-grid > *',
        '.login-card > *',
      ].join(', '),
    ),
  ).slice(0, 22);
  const rows = unique(
    all<HTMLElement>(
      root,
      '.admin-main .recent-row, .admin-main .table-row, .admin-main .resource-list > article',
    ),
  ).slice(0, 16);
  const targets = [...eyebrow, ...titles, ...actions, ...frames, ...rows];

  if (eyebrow.length) {
    gsap.set(eyebrow, { autoAlpha: 0, scaleX: 0.35, transformOrigin: '0% 50%' });
  }
  if (titles.length) {
    gsap.set(titles, {
      autoAlpha: 0,
      rotationX: -42,
      transformOrigin: '50% 100%',
      transformPerspective: 900,
    });
  }
  if (actions.length) {
    gsap.set(actions, { autoAlpha: 0, scaleX: 0.72, transformOrigin: '50% 50%' });
  }
  if (frames.length) {
    gsap.set(frames, {
      autoAlpha: 0,
      scaleX: 0.965,
      transformOrigin: (index) => (index % 2 ? '100% 50%' : '0% 50%'),
    });
  }
  if (rows.length) {
    gsap.set(rows, {
      autoAlpha: 0,
      rotationX: -12,
      transformOrigin: '50% 100%',
      transformPerspective: 900,
    });
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      if (targets.length) {
        gsap.set(targets, { clearProps: 'opacity,visibility,transform' });
      }
    },
  });
  timeline.addLabel('heading', 0).addLabel('workspace', 0.18).addLabel('details', 0.34);
  if (eyebrow.length) {
    timeline.to(eyebrow, { autoAlpha: 1, scaleX: 1, duration: 0.34 }, 'heading');
  }
  if (titles.length) {
    timeline.to(titles, { autoAlpha: 1, rotationX: 0, duration: 0.52 }, 'heading+=0.05');
  }
  if (actions.length) {
    timeline.to(actions, { autoAlpha: 1, scaleX: 1, duration: 0.34 }, 'workspace');
  }
  if (frames.length) {
    timeline.to(
      frames,
      { autoAlpha: 1, scaleX: 1, duration: 0.42, stagger: 0.035 },
      'workspace',
    );
  }
  if (rows.length) {
    timeline.to(
      rows,
      { autoAlpha: 1, rotationX: 0, duration: 0.34, stagger: 0.025 },
      'details',
    );
  }
}

function buildDeskRoute(root: HTMLElement) {
  const eyebrow = all<HTMLElement>(
    root,
    '.desk-welcome .eyebrow, .desk-section-heading .eyebrow',
  );
  const titles = all<HTMLElement>(root, '.desk-welcome h1, .desk-section-heading h1');
  const context = all<HTMLElement>(
    root,
    '.desk-date, .desk-section-heading > p, .desk-welcome-character',
  );
  const frames = unique(
    all<HTMLElement>(
      root,
      [
        '.desk-stat',
        '.desk-home-panel',
        '.desk-home-note',
        '.desk-tool-layout > *',
        '.desk-collection-layout > *',
      ].join(', '),
    ),
  ).slice(0, 20);
  const rows = unique(
    all<HTMLElement>(
      root,
      '.desk-shortcuts > *, .tool-index > *, .note-card, .snippet-card, .bookmark-card',
    ),
  ).slice(0, 18);
  const targets = [...eyebrow, ...titles, ...context, ...frames, ...rows];

  if (eyebrow.length) {
    gsap.set(eyebrow, { autoAlpha: 0, scaleX: 0.35, transformOrigin: '0% 50%' });
  }
  if (titles.length) {
    gsap.set(titles, {
      autoAlpha: 0,
      rotationX: -42,
      transformOrigin: '50% 100%',
      transformPerspective: 900,
    });
  }
  if (context.length) {
    gsap.set(context, {
      autoAlpha: 0,
      rotationX: -14,
      transformOrigin: '50% 100%',
      transformPerspective: 800,
    });
  }
  if (frames.length) {
    gsap.set(frames, {
      autoAlpha: 0,
      scaleX: 0.96,
      transformOrigin: (index) => (index % 2 ? '100% 50%' : '0% 50%'),
    });
  }
  if (rows.length) {
    gsap.set(rows, {
      autoAlpha: 0,
      rotationX: -16,
      transformOrigin: '50% 100%',
      transformPerspective: 900,
    });
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      if (targets.length) {
        gsap.set(targets, { clearProps: 'opacity,visibility,transform' });
      }
    },
  });
  timeline.addLabel('greeting', 0).addLabel('tools', 0.2).addLabel('details', 0.36);
  if (eyebrow.length) {
    timeline.to(eyebrow, { autoAlpha: 1, scaleX: 1, duration: 0.34 }, 'greeting');
  }
  if (titles.length) {
    timeline.to(titles, { autoAlpha: 1, rotationX: 0, duration: 0.52 }, 'greeting+=0.04');
  }
  if (context.length) {
    timeline.to(
      context,
      { autoAlpha: 1, rotationX: 0, duration: 0.38, stagger: 0.04 },
      'tools-=0.05',
    );
  }
  if (frames.length) {
    timeline.to(
      frames,
      { autoAlpha: 1, scaleX: 1, duration: 0.42, stagger: 0.035 },
      'tools',
    );
  }
  if (rows.length) {
    timeline.to(
      rows,
      { autoAlpha: 1, rotationX: 0, duration: 0.34, stagger: 0.025 },
      'details',
    );
  }
}

function one<T extends Element>(root: ParentNode, selector: string) {
  return root.querySelector<T>(selector);
}

function all<T extends Element>(root: Element, selector: string) {
  return gsap.utils.toArray<T>(selector, root);
}

function unique<T extends Element>(targets: T[]) {
  return [...new Set(targets)];
}
