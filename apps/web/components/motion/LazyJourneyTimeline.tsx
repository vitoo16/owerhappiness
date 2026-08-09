'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { MilestoneDto } from '@portfolio/contracts';
import { gsap, ScrollTrigger, useGSAP } from './gsap';

const DeferredJourneyTimeline = dynamic(
  () => import('../JourneyTimeline').then((module) => module.JourneyTimeline),
  { loading: () => null },
);

export function LazyJourneyTimeline({ items }: { items: MilestoneDto[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);
  const { contextSafe } = useGSAP({ scope: root });

  const requestLoad = contextSafe(() => setRequested(true));
  const markReady = contextSafe(() => {
    setReady(true);
    gsap.delayedCall(0, () => ScrollTrigger.refresh());
  });

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const loader = ScrollTrigger.create({
        id: 'home-journey-loader',
        trigger: element,
        start: 'top 125%',
        end: 'bottom -25%',
        once: true,
        refreshPriority: 30,
        onEnter: requestLoad,
        onEnterBack: requestLoad,
      });

      return () => loader.kill();
    },
    { scope: root },
  );

  const reservedHeight = Math.max(1, items.length) * 190 + 80;

  return (
    <div
      className="lazy-journey-shell"
      data-ready={ready}
      aria-busy={!ready}
      ref={root}
      style={{ minHeight: reservedHeight }}
    >
      <div className="lazy-journey-placeholder" aria-hidden>
        <span className="lazy-journey-placeholder-line" />
        {Array.from({ length: Math.max(1, items.length) }, (_, index) => (
          <span className="lazy-journey-placeholder-row" key={index} />
        ))}
        <small>journey loads as you arrive</small>
      </div>

      {requested ? <DeferredJourneyTimeline items={items} onReady={markReady} /> : null}
    </div>
  );
}
