'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('[data-hero="eyebrow"]', { autoAlpha: 0, y: 12, duration: 0.55 })
          .from(
            '[data-hero="line"]',
            { autoAlpha: 0, yPercent: 80, stagger: 0.1, duration: 0.8 },
            '-=0.2',
          )
          .from(
            '[data-hero="support"]',
            { autoAlpha: 0, y: 14, duration: 0.55 },
            '-=0.35',
          )
          .from(
            '[data-hero="mascot"]',
            { autoAlpha: 0, rotate: -5, scale: 0.92, duration: 0.7 },
            '-=0.55',
          );
      });

      return () => media.revert();
    }, element);

    return () => context.revert();
  }, []);

  return <div ref={root}>{children}</div>;
}
