'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from './gsap';

export function PageLoadingMotion() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const label = element.querySelector<HTMLElement>('span');
        const dots = gsap.utils.toArray<HTMLElement>('i', element);
        const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

        if (label) {
          timeline.from(label, { autoAlpha: 0, scaleX: 0.65, duration: 0.32 });
        }
        timeline.from(
          dots,
          { autoAlpha: 0, scale: 0.2, duration: 0.34, stagger: 0.08 },
          0.08,
        );
        gsap.to(dots, {
          autoAlpha: 0.2,
          scale: 0.72,
          duration: 0.55,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          stagger: 0.12,
        });
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div className="page-loading" aria-live="polite" ref={root}>
      <span>loading</span>
      <i />
      <i />
      <i />
    </div>
  );
}
