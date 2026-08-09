'use client';

import { useRef } from 'react';
import type { MilestoneDto } from '@portfolio/contracts';
import { gsap, useGSAP } from './motion/gsap';
import { Stickman } from './Stickman';

export function JourneyTimeline({
  items,
  onReady,
}: {
  items: MilestoneDto[];
  onReady?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const mascot = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add(
        {
          isDesktop: '(min-width: 901px)',
          isMobile: '(max-width: 900px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };
          const progress = element.querySelector<HTMLElement>('[data-timeline-progress]');
          const milestones = gsap.utils.toArray<HTMLElement>('[data-milestone]');

          if (reduceMotion) {
            if (progress) gsap.set(progress, { scaleY: 1 });
            return;
          }

          const storyDuration = Math.max(1, milestones.length);
          const timeline = gsap.timeline({
            defaults: { duration: 0.48, ease: 'power3.out' },
            scrollTrigger: {
              trigger: element,
              start: isDesktop ? 'top 72%' : 'top 82%',
              end: isDesktop ? 'bottom 72%' : 'bottom 80%',
              scrub: isDesktop ? 0.65 : 0.3,
              invalidateOnRefresh: true,
              refreshPriority: 30,
            },
          });

          timeline.addLabel('journey-start', 0);
          if (progress) {
            timeline.fromTo(
              progress,
              { scaleY: 0 },
              { scaleY: 1, duration: storyDuration, ease: 'none' },
              'journey-start',
            );
          }
          if (mascot.current) {
            timeline.fromTo(
              mascot.current,
              { y: 0 },
              {
                y: () =>
                  Math.max(0, element.scrollHeight - (mascot.current?.offsetHeight ?? 0) + 55),
                duration: storyDuration,
                ease: 'none',
              },
              'journey-start',
            );
          }

          milestones.forEach((milestone, index) => {
            const year = milestone.querySelector<HTMLElement>(':scope > time');
            const dot = milestone.querySelector<HTMLElement>(':scope > .milestone-dot');
            const copy = milestone.querySelector<HTMLElement>(':scope > div:not(.milestone-dot)');
            const character = milestone.querySelector<HTMLElement>(':scope > .milestone-stick');
            const label = `milestone-${index + 1}`;
            const position =
              milestones.length === 1
                ? 0.15
                : (index / (milestones.length - 1)) * Math.max(0.5, storyDuration - 0.55);
            timeline.addLabel(label, position);
            if (year) {
              timeline.from(year, { autoAlpha: 0, x: -16 }, label);
            }
            if (dot) {
              timeline
                .from(dot, { autoAlpha: 0, scale: 0.25, duration: 0.36 }, `${label}+=0.04`)
                .to(
                  dot,
                  { backgroundColor: 'var(--accent)', scale: 1.16, duration: 0.32 },
                  `${label}+=0.18`,
                );
            }
            if (copy) {
              timeline.from(copy, { autoAlpha: 0, y: 24 }, `${label}+=0.08`);
            }
            if (character) {
              timeline.from(
                character,
                { autoAlpha: 0, rotation: -7, scale: 0.88 },
                `${label}+=0.14`,
              );
            }
          });
        },
      );

      onReady?.();

      return () => media.revert();
    },
    { scope: root, dependencies: [onReady], revertOnUpdate: true },
  );

  return (
    <div className="journey-timeline" ref={root}>
      <div className="timeline-line" aria-hidden>
        <span data-timeline-progress />
      </div>
      <div className="timeline-mascot" ref={mascot} aria-hidden>
        <Stickman pose="walk" />
      </div>

      {items.map((milestone, index) => (
        <article
          key={milestone.id}
          className="milestone"
          data-milestone
          data-milestone-index={index + 1}
        >
          <time dateTime={milestone.date}>{new Date(milestone.date).getFullYear()}</time>
          <div className="milestone-dot" aria-hidden />
          <div>
            <span className="eyebrow">{milestone.type}</span>
            <h3>{milestone.title}</h3>
            <p>{milestone.description}</p>
          </div>
          {index % 3 === 2 ? <Stickman pose="celebrate" className="milestone-stick" /> : null}
        </article>
      ))}
    </div>
  );
}
