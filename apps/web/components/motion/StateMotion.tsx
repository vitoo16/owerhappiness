'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from './storyGsap';

export function StateMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const heading = element.querySelector<HTMLElement>('h1');
        const label = element.querySelector<HTMLElement>('.eyebrow');
        const action = element.querySelector<HTMLElement>('.button');
        const strokes = gsap.utils.toArray<SVGPathElement>('.stickman path', element);
        const split = heading
          ? SplitText.create(heading, {
              aria: 'auto',
              linesClass: 'route-motion-line',
              mask: 'lines',
              type: 'lines',
            })
          : null;
        const lines = (split?.lines as HTMLElement[] | undefined) ?? [];
        const targets = [label, ...lines, action].filter(
          (target): target is HTMLElement => Boolean(target),
        );

        if (label) gsap.set(label, { autoAlpha: 0, scaleX: 0.3 });
        gsap.set(lines, { autoAlpha: 0, rotationX: -58, transformPerspective: 1000 });
        if (action) gsap.set(action, { autoAlpha: 0, scaleX: 0.7 });
        if (strokes.length) gsap.set(strokes, { drawSVG: '0% 0%' });

        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => gsap.set(targets, { clearProps: 'opacity,visibility,transform' }),
        });
        if (strokes.length) {
          timeline.to(strokes, {
            drawSVG: '0% 100%',
            duration: 0.64,
            stagger: { amount: 0.34, from: 'start' },
          });
        }
        if (label) timeline.to(label, { autoAlpha: 1, scaleX: 1, duration: 0.34 }, 0.18);
        if (lines.length) {
          timeline.to(
            lines,
            { autoAlpha: 1, rotationX: 0, duration: 0.56, stagger: 0.07 },
            0.26,
          );
        }
        if (action) timeline.to(action, { autoAlpha: 1, scaleX: 1, duration: 0.34 }, 0.52);

        return () => split?.revert();
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
