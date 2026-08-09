'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP } from './gsap';

type MotionVariant = 'public' | 'admin' | 'desk';

const selectors: Record<MotionVariant, { chrome: string; primary: string; secondary: string }> = {
  public: {
    chrome: '.site-header .brand, .desktop-site-nav > *, .mobile-site-nav > summary',
    primary:
      '.page-shell .section-label, .page-heading > *, .case-hero > .text-link, .case-title-grid > *',
    secondary:
      '.filter-nav, .project-list > *, .lab-grid > *, .about-page-head > *, .contact-page > *, .case-meta > *, .case-cover',
  },
  admin: {
    chrome: '.admin-sidebar .brand, .admin-caption, .admin-sidebar nav > *, .admin-user',
    primary: '.admin-heading > *, .login-card > *',
    secondary:
      '.admin-filters, .stat-card, .admin-panel, .admin-table, .admin-empty, .project-editor > *',
  },
  desk: {
    chrome: '.desk-sidebar > *, .desk-header > *',
    primary: '.desk-welcome > *, .desk-section-heading > *',
    secondary:
      '.desk-stat, .desk-home-grid > *, .desk-tool-layout > *, .desk-collection-layout > *',
  },
};

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
        const chrome = uniqueTargets(element, selectors[variant].chrome).slice(0, 12);
        if (!chrome.length) return;

        const timeline = gsap.timeline({
          defaults: { duration: 0.48, ease: 'power3.out' },
          onComplete: () => clearMotionProps(chrome),
        });
        timeline
          .addLabel('chrome', 0)
          .from(chrome, { autoAlpha: 0, y: -10, stagger: 0.035 }, 'chrome');
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [variant], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const primary = uniqueTargets(element, selectors[variant].primary).slice(0, 8);
        const secondary = uniqueTargets(element, selectors[variant].secondary)
          .filter((target) => !primary.includes(target))
          .slice(0, 14);
        const targets = [...primary, ...secondary];
        if (!targets.length) return;

        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => clearMotionProps(targets),
        });

        timeline.addLabel('page', 0);
        if (primary.length) {
          timeline.from(primary, { autoAlpha: 0, y: 24, duration: 0.58, stagger: 0.055 }, 'page');
        }
        if (secondary.length) {
          timeline.from(
            secondary,
            { autoAlpha: 0, y: 16, duration: 0.46, stagger: 0.035 },
            'page+=0.14',
          );
        }
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

function uniqueTargets(root: HTMLElement, selector: string) {
  return [...new Set(root.querySelectorAll<HTMLElement>(selector))];
}

function clearMotionProps(targets: HTMLElement[]) {
  gsap.set(targets, { clearProps: 'opacity,visibility,transform' });
}
