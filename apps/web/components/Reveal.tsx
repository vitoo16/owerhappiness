'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from './motion/gsap';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

export function Reveal({ children, className }: RevealProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = element.children.length > 1 ? [...element.children] : [element];
        const timeline = gsap.timeline({
          defaults: { duration: 0.7, ease: 'power3.out' },
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true,
          },
          onComplete: () => gsap.set(targets, { clearProps: 'opacity,visibility,transform' }),
        });
        timeline
          .addLabel('reveal', 0)
          .from(targets, { autoAlpha: 0, y: 28, stagger: 0.075 }, 'reveal');
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
