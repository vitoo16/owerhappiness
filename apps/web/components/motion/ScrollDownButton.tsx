'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from './gsap';

export function ScrollDownButton({ targetId }: { targetId: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const { contextSafe } = useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('[data-scroll-arrow]', {
          y: 5,
          duration: 0.75,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });

      return () => media.revert();
    },
    { scope: button },
  );

  const scrollDown = contextSafe(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.scrollIntoView();
      return;
    }

    gsap.to(window, {
      duration: 1.05,
      ease: 'power3.inOut',
      overwrite: 'auto',
      scrollTo: { y: target, offsetY: 68 },
    });
  });

  return (
    <button
      className="scroll-hint"
      data-hero="scroll"
      ref={button}
      type="button"
      onClick={scrollDown}
      aria-label="Scroll to the About section"
    >
      <span>scroll</span>
      <i data-scroll-arrow aria-hidden>
        ↓
      </i>
    </button>
  );
}
