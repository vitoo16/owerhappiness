'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MilestoneDto } from '@portfolio/contracts';
import { Stickman } from './Stickman';

gsap.registerPlugin(ScrollTrigger);

export function JourneyTimeline({ items }: { items: MilestoneDto[] }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-timeline-line]',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top 70%',
              end: 'bottom 75%',
              scrub: true,
            },
          },
        );

        gsap.utils.toArray<HTMLElement>('[data-milestone]').forEach((milestone) => {
          gsap.from(milestone, {
            autoAlpha: 0,
            x: -18,
            duration: 0.55,
            scrollTrigger: {
              trigger: milestone,
              start: 'top 85%',
              once: true,
            },
          });
        });
      });

      return () => media.revert();
    }, element);

    return () => context.revert();
  }, []);

  return (
    <div className="journey-timeline" ref={root}>
      <div className="timeline-line" data-timeline-line />
      <div className="timeline-mascot" aria-hidden>
        <Stickman pose="walk" />
      </div>

      {items.map((milestone, index) => (
        <article key={milestone.id} className="milestone" data-milestone>
          <time dateTime={milestone.date}>{new Date(milestone.date).getFullYear()}</time>
          <div className="milestone-dot" aria-hidden />
          <div>
            <span className="eyebrow">{milestone.type}</span>
            <h3>{milestone.title}</h3>
            <p>{milestone.description}</p>
          </div>
          {index % 3 === 2 ? (
            <Stickman pose="celebrate" className="milestone-stick" />
          ) : null}
        </article>
      ))}
    </div>
  );
}
