'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from './gsap';

export function ScrollDownButton({ targetId }: { targetId: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const { contextSafe } = useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          motionPreference: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { reduceMotion } = context.conditions as {
            reduceMotion: boolean;
            motionPreference: boolean;
          };
          gsap.to('[data-scroll-arrow]', {
            y: reduceMotion ? 2 : 5,
            duration: reduceMotion ? 1.1 : 0.75,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });
        },
      );

      return () => media.revert();
    },
    { scope: button },
  );

  const scrollDown = contextSafe(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.to(window, {
      duration: reduceMotion ? 0.55 : 1.05,
      ease: 'power3.inOut',
      overwrite: true,
      scrollTo: { y: target, offsetY: 68, autoKill: false },
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
