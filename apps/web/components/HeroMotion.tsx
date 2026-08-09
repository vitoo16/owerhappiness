'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from './motion/gsap';

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const eyebrow = element.querySelector<HTMLElement>('[data-hero="eyebrow"]');
        const lines = gsap.utils.toArray<HTMLElement>('[data-hero="line"]');
        const support = gsap.utils.toArray<HTMLElement>('[data-hero="support"]');
        const mascot = element.querySelector<HTMLElement>('[data-hero="mascot"]');
        const mascotFigure = mascot?.querySelector<HTMLElement>('.stickman');
        const scroll = element.querySelector<HTMLElement>('[data-hero="scroll"]');
        const introTargets = [eyebrow, ...lines, ...support, mascot, scroll].filter(
          (target): target is HTMLElement => Boolean(target),
        );

        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () =>
            gsap.set(
              introTargets.filter((target) => target !== mascot),
              {
                clearProps: 'opacity,visibility,transform',
              },
            ),
        });

        timeline.addLabel('copy', 0);
        if (eyebrow) {
          timeline.from(eyebrow, { autoAlpha: 0, y: 12, duration: 0.55 }, 'copy');
        }
        timeline.from(
          lines,
          { autoAlpha: 0, yPercent: 80, stagger: 0.1, duration: 0.8 },
          'copy+=0.12',
        );
        timeline.from(support, { autoAlpha: 0, y: 14, duration: 0.55 }, 'copy+=0.44');
        if (mascot) {
          timeline.from(
            mascot,
            { autoAlpha: 0, rotate: -5, scale: 0.92, duration: 0.7 },
            'copy+=0.34',
          );
        }
        if (scroll) {
          timeline.from(scroll, { autoAlpha: 0, y: -8, duration: 0.45 }, 'copy+=0.78');
        }

        if (mascotFigure) {
          gsap.to(mascotFigure, {
            y: -7,
            rotation: 1,
            duration: 1.9,
            delay: 1.35,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
