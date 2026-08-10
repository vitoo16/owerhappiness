'use client';

import { Stickman } from '@/components/Stickman';
import { StateMotion } from '@/components/motion/StateMotion';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <StateMotion>
      <main className="center-state section-blush">
        <Stickman pose="sleep" />
        <p className="eyebrow">SOMETHING WENT SIDEWAYS</p>
        <h1>
          the tiny server brain
          <br />
          needs another try.
        </h1>
        <button className="button" type="button" onClick={reset}>
          try again →
        </button>
      </main>
    </StateMotion>
  );
}
