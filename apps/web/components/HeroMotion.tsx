'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from './motion/homeGsap';

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

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
          const eyebrow = element.querySelector<HTMLElement>('[data-hero="eyebrow"]');
          const lines = gsap.utils.toArray<HTMLElement>('[data-hero="line"]', element);
          const support = gsap.utils.toArray<HTMLElement>('[data-hero="support"]', element);
          const mascot = element.querySelector<HTMLElement>('[data-hero="mascot"]');
          const mascotFigure = mascot?.querySelector<SVGSVGElement>('.stickman');
          const scroll = element.querySelector<HTMLElement>('[data-hero="scroll"]');
          const scene = element.closest<HTMLElement>('[data-story-section]');
          const heading = element.querySelector<HTMLElement>('h1');
          const split = heading
            ? SplitText.create(heading, {
                aria: 'auto',
                type: 'words',
                wordsClass: 'hero-word',
              })
            : null;
          const words = (split?.words as HTMLElement[] | undefined) ?? lines;
          const strokes = mascotFigure
            ? gsap.utils.toArray<SVGPathElement>('path', mascotFigure)
            : [];
          const introTargets = [eyebrow, ...words, ...support, mascot, scroll].filter(
            (target): target is HTMLElement => Boolean(target),
          );

          gsap.set(words, {
            autoAlpha: 0,
            rotationX: reduceMotion ? -8 : -68,
            scale: reduceMotion ? 0.99 : 0.965,
            transformOrigin: '50% 100%',
            transformPerspective: 900,
          });
          if (strokes.length && !reduceMotion) {
            gsap.set(strokes, { drawSVG: '0% 0%' });
          }

          const timeline = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () =>
              gsap.set(
                introTargets.filter((target) => target !== mascot),
                { clearProps: 'opacity,visibility,transform' },
              ),
          });

          timeline.addLabel('copy', 0);
          if (eyebrow) {
            timeline.from(
              eyebrow,
              { autoAlpha: 0, y: reduceMotion ? 5 : 10, duration: reduceMotion ? 0.3 : 0.5 },
              'copy',
            );
          }
          timeline.to(
            words,
            {
              autoAlpha: 1,
              rotationX: 0,
              scale: 1,
              stagger: reduceMotion ? 0.035 : 0.055,
              duration: reduceMotion ? 0.42 : 0.72,
            },
            'copy+=0.1',
          );
          timeline.from(
            support,
            {
              autoAlpha: 0,
              y: reduceMotion ? 5 : 10,
              duration: reduceMotion ? 0.32 : 0.5,
            },
            'copy+=0.4',
          );
          if (mascot) {
            timeline.from(
              mascot,
              {
                autoAlpha: 0,
                rotation: reduceMotion ? -2 : -5,
                scale: reduceMotion ? 0.97 : 0.92,
                duration: reduceMotion ? 0.4 : 0.68,
              },
              'copy+=0.28',
            );
          }
          if (strokes.length && !reduceMotion) {
            timeline.to(
              strokes,
              {
                drawSVG: '0% 100%',
                duration: 0.72,
                ease: 'power2.out',
                stagger: { amount: 0.38, from: 'start' },
              },
              'copy+=0.3',
            );
          }
          if (scroll) {
            timeline.from(scroll, { autoAlpha: 0, y: -6, duration: 0.42 }, 'copy+=0.72');
          }

          if (mascotFigure && scene && !reduceMotion) {
            gsap.to(mascotFigure, {
              y: -7,
              rotation: 1,
              duration: 1.9,
              delay: 1.25,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              scrollTrigger: {
                trigger: scene,
                start: 'top bottom',
                end: 'bottom top',
                toggleActions: 'play pause resume pause',
              },
            });
          }
        },
      );

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div data-story-content ref={root}>
      {children}
    </div>
  );
}
