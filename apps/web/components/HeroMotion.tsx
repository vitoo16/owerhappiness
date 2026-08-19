'use client';

import { useRef } from 'react';
import {
  INTRO_COMPLETE_EVENT,
  isSeamlessIntroHandoff,
  shouldPlayIntro,
} from './motion/introGate';
import { gsap, SplitText, useGSAP } from './motion/storyGsap';

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      let detachIntroWait: (() => void) | undefined;

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

          const runHero = () => {
            const seamless = isSeamlessIntroHandoff();
            const eyebrow = element.querySelector<HTMLElement>('[data-hero="eyebrow"]');
            const lines = gsap.utils.toArray<HTMLElement>('[data-hero="line"]', element);
            const support = gsap.utils.toArray<HTMLElement>('[data-hero="support"]', element);
            const mascot = element.querySelector<HTMLElement>('[data-hero="mascot"]');
            const mascotFigure = mascot?.querySelector<SVGSVGElement>('.stickman');
            const handNote = mascot?.querySelector<HTMLElement>('.hand-note');
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
            const splitWords = (split?.words as HTMLElement[] | undefined) ?? [];
            // Empty array is truthy for ?? — fall back to line spans when SplitText yields nothing.
            const words = splitWords.length > 0 ? splitWords : lines;
            const strokes = mascotFigure
              ? gsap.utils.toArray<SVGPathElement>('path', mascotFigure)
              : [];
            const introTargets = [eyebrow, ...words, ...support, scroll].filter(
              (target): target is HTMLElement => Boolean(target),
            );

            // Clear any pre-hide inline styles from the intro handoff.
            gsap.set([eyebrow, ...lines, ...support, scroll].filter(Boolean), {
              clearProps: 'opacity,visibility',
            });

            gsap.set(words, {
              autoAlpha: 0,
              rotationX: reduceMotion ? -8 : -68,
              scale: reduceMotion ? 0.99 : 0.965,
              transformOrigin: '50% 100%',
              transformPerspective: 900,
            });

            // Seamless handoff: mascot is already the same stickman — don't re-draw or fade it in.
            if (seamless && mascot) {
              gsap.set(mascot, { autoAlpha: 1, clearProps: 'transform' });
              if (handNote) gsap.set(handNote, { autoAlpha: 0, rotation: -10, scale: 0.9 });
              const copy = element.querySelector<HTMLElement>('.hero-copy');
              if (copy) gsap.set(copy, { autoAlpha: 1, clearProps: 'visibility' });
            } else if (strokes.length && !reduceMotion) {
              gsap.set(strokes, { drawSVG: '0% 0%' });
            }

            const clearTargets = [mascot, ...introTargets].filter(
              (target): target is HTMLElement => Boolean(target),
            );

            const timeline = gsap.timeline({
              defaults: { ease: 'power3.out' },
              onComplete: () =>
                gsap.set(clearTargets, {
                  clearProps: 'opacity,visibility,transform',
                }),
            });

            timeline.addLabel('copy', 0);
            if (eyebrow) {
              timeline.fromTo(
                eyebrow,
                { autoAlpha: 0, y: reduceMotion ? 5 : 10 },
                { autoAlpha: 1, y: 0, duration: reduceMotion ? 0.3 : 0.5 },
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

            if (seamless) {
              if (handNote) {
                timeline.to(
                  handNote,
                  {
                    autoAlpha: 1,
                    rotation: -7,
                    scale: 1,
                    duration: reduceMotion ? 0.3 : 0.45,
                    ease: 'back.out(1.6)',
                  },
                  'copy+=0.2',
                );
              }
            } else if (mascot) {
              // fromTo — never set autoAlpha 0 then from(0); that freezes the mascot invisible.
              timeline.fromTo(
                mascot,
                {
                  autoAlpha: 0,
                  rotation: reduceMotion ? -2 : -5,
                  scale: reduceMotion ? 0.97 : 0.92,
                },
                {
                  autoAlpha: 1,
                  rotation: 0,
                  scale: 1,
                  duration: reduceMotion ? 0.4 : 0.68,
                },
                'copy+=0.28',
              );
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
            }

            if (scroll) {
              timeline.from(
                scroll,
                { autoAlpha: 0, y: -6, duration: 0.42 },
                'copy+=0.72',
              );
            }

            if (mascotFigure && scene && !reduceMotion) {
              gsap.to(mascotFigure, {
                y: -7,
                rotation: 1,
                duration: 1.9,
                delay: seamless ? 0.35 : 1.25,
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
          };

          if (
            !reduceMotion &&
            shouldPlayIntro() &&
            document.documentElement.dataset.intro !== 'done'
          ) {
            const onIntroComplete = () => runHero();
            window.addEventListener(INTRO_COMPLETE_EVENT, onIntroComplete, {
              once: true,
            });
            detachIntroWait = () =>
              window.removeEventListener(INTRO_COMPLETE_EVENT, onIntroComplete);
            return;
          }

          runHero();
        },
      );

      return () => {
        detachIntroWait?.();
        media.revert();
      };
    },
    { scope: root },
  );

  return (
    <div data-story-content ref={root}>
      {children}
    </div>
  );
}
