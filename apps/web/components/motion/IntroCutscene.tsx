'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stickman, type StickEmotion, type StickPose } from '@/components/Stickman';
import {
  announceIntroComplete,
  lockIntroScroll,
  releaseIntroHero,
  shouldPlayIntro,
} from './introGate';
import { Flip, gsap, useGSAP } from './storyGsap';

type IntroCutsceneProps = {
  onComplete?: () => void;
};

/**
 * Intro story with the same path-authored Stickman as the rest of the site.
 * Poses swap for emotion/limbs (no free joint rotation — that broke the arms).
 * Ends with a Flip into the hero mascot slot.
 */
export function IntroCutscene({ onComplete }: IntroCutsceneProps) {
  const [playing, setPlaying] = useState(false);

  useLayoutEffect(() => {
    if (shouldPlayIntro()) {
      lockIntroScroll();
      setPlaying(true);
      return;
    }
    document.documentElement.dataset.intro = 'done';
  }, []);

  if (!playing) return null;

  return (
    <IntroCutscenePlayer
      onComplete={() => {
        setPlaying(false);
        onComplete?.();
      }}
    />
  );
}

function IntroCutscenePlayer({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [pose, setPose] = useState<StickPose>('sleep');
  const [emotion, setEmotion] = useState<StickEmotion>('sleepy');

  useGSAP(
    () => {
      const rootEl = root.current;
      const actor = actorRef.current;
      if (!rootEl || !actor) return;

      let timeline: gsap.core.Timeline | null = null;
      let bobTween: gsap.core.Tween | null = null;
      let heroReleased = false;

      const caption = rootEl.querySelector<HTMLElement>('[data-intro-caption]');
      const skip = rootEl.querySelector<HTMLElement>('[data-intro-skip]');
      const ground = rootEl.querySelector<HTMLElement>('[data-intro-ground]');
      const svg = () => actor.querySelector<SVGSVGElement>('.stickman');

      const releaseHero = (seamless: boolean) => {
        if (heroReleased) return;
        heroReleased = true;
        releaseIntroHero({ seamless });
      };

      const finish = () => {
        if (finished.current) return;
        finished.current = true;
        bobTween?.kill();
        timeline?.kill();
        releaseHero(true);
        announceIntroComplete();
        onCompleteRef.current();
      };

      const heroMascot = () =>
        document.querySelector<HTMLElement>('[data-story="hero"] [data-hero="mascot"]');

      const say = (text: string, at: string) => {
        if (!caption) return;
        timeline!.call(() => {
          caption.textContent = text;
        }, undefined, at);
        timeline!.to(
          caption,
          { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' },
          at,
        );
      };

      const become = (nextPose: StickPose, nextEmotion: StickEmotion, at: string) => {
        timeline!.call(() => {
          setPose(nextPose);
          setEmotion(nextEmotion);
        }, undefined, at);
      };

      gsap.set(actor, {
        x: -Math.min(window.innerWidth * 0.28, 340),
        y: 24,
        scale: 0.94,
        rotation: -4,
        transformOrigin: '50% 100%',
        autoAlpha: 1,
      });
      if (caption) gsap.set(caption, { autoAlpha: 0, y: 14 });
      if (skip) gsap.set(skip, { autoAlpha: 0 });

      // Draw-on birth
      const strokes = gsap.utils.toArray<SVGElement>('path, circle', actor);
      gsap.set(strokes, { drawSVG: '0% 0%' });

      timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: finish,
      });

      timeline
        .addLabel('birth', 0)
        .to(
          strokes,
          {
            drawSVG: '0% 100%',
            duration: 1,
            stagger: { amount: 0.5, from: 'start' },
            ease: 'power2.out',
          },
          'birth',
        );
      say('…', 'birth+=0.25');
      if (skip) timeline.to(skip, { autoAlpha: 1, duration: 0.3 }, 'birth+=0.4');

      // Wake / stretch
      timeline
        .addLabel('wake', 'birth+=1.1')
        .to(actor, { y: 0, rotation: 0, scale: 1, duration: 0.45, ease: 'power2.out' }, 'wake');
      become('celebrate', 'sleepy', 'wake');
      say('yawn…', 'wake');
      timeline.to(actor, { y: -10, duration: 0.35, ease: 'power2.out' }, 'wake+=0.15');
      timeline.to(actor, { y: 0, duration: 0.4, ease: 'bounce.out' }, 'wake+=0.5');

      // Look around (curious)
      timeline.addLabel('look', 'wake+=1.0');
      become('think', 'curious', 'look');
      say('where am i?', 'look');
      timeline
        .to(actor, { rotation: 5, duration: 0.35, ease: 'power2.out' }, 'look+=0.1')
        .to(actor, { rotation: -6, duration: 0.4, ease: 'power2.inOut' }, 'look+=0.5')
        .to(actor, { rotation: 0, duration: 0.3, ease: 'power2.out' }, 'look+=0.95');

      // Spark — shocked hop
      timeline.addLabel('spark', 'look+=1.35');
      become('point', 'shocked', 'spark');
      say('oh!', 'spark');
      timeline
        .to(actor, { y: -30, duration: 0.22, ease: 'power2.out' }, 'spark')
        .to(actor, { y: 0, duration: 0.34, ease: 'bounce.out' }, 'spark+=0.22');

      // Walk across
      timeline.addLabel('strut', 'spark+=0.7');
      become('walk', 'happy', 'strut');
      say('let’s go', 'strut');
      bobTween = gsap.to(actor, {
        y: -9,
        rotation: 1.5,
        duration: 0.17,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      timeline.to(
        actor,
        { x: 0, duration: 1.7, ease: 'none' },
        'strut',
      );

      // Celebrate
      timeline
        .addLabel('cheer', 'strut+=1.7')
        .call(() => {
          bobTween?.kill();
          bobTween = null;
          gsap.set(actor, { y: 0, rotation: 0 });
        }, undefined, 'cheer');
      become('celebrate', 'proud', 'cheer');
      say('this is home', 'cheer');
      timeline
        .to(actor, { y: -20, duration: 0.28, ease: 'power2.out' }, 'cheer')
        .to(actor, { y: 0, duration: 0.4, ease: 'bounce.out' }, 'cheer+=0.28');

      // Wave hello
      timeline.addLabel('hello', 'cheer+=0.85');
      become('wave', 'happy', 'hello');
      say('hi there :)', 'hello');
      timeline.to(
        actor,
        {
          rotation: 3,
          duration: 0.18,
          yoyo: true,
          repeat: 3,
          ease: 'sine.inOut',
        },
        'hello+=0.15',
      );

      // Flip into hero
      timeline
        .addLabel('handoff', 'hello+=1.1')
        .call(
          () => {
            const mascot = heroMascot();
            const hero = document.querySelector<HTMLElement>('[data-story="hero"]');
            if (!mascot || !hero) {
              releaseHero(false);
              return;
            }

            const copy = hero.querySelector<HTMLElement>('.hero-copy');
            const scrollHint = hero.querySelector<HTMLElement>('[data-hero="scroll"]');
            const handNote = hero.querySelector<HTMLElement>('.hand-note');
            if (copy) gsap.set(copy, { autoAlpha: 0 });
            if (scrollHint) gsap.set(scrollHint, { autoAlpha: 0 });
            if (handNote) gsap.set(handNote, { autoAlpha: 0 });

            bobTween?.kill();
            setPose('wave');
            setEmotion('happy');
            gsap.set(actor, { y: 0, rotation: 0 });

            const state = Flip.getState(actor);
            const target = mascot.getBoundingClientRect();

            gsap.set(actor, {
              position: 'fixed',
              left: target.left,
              top: target.top,
              width: target.width,
              height: 'auto',
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              zIndex: 210,
              margin: 0,
            });

            Flip.from(state, {
              duration: 0.95,
              ease: 'power3.inOut',
              absolute: true,
              scale: true,
              onComplete: () => {
                gsap.set(mascot, { autoAlpha: 1 });
                gsap.set(actor, { autoAlpha: 0 });
                releaseHero(true);
              },
            });
          },
          undefined,
          'handoff',
        )
        .to(
          rootEl,
          { backgroundColor: 'transparent', duration: 0.65, ease: 'power2.out' },
          'handoff+=0.12',
        );

      if (caption) {
        timeline.to(
          caption,
          { autoAlpha: 0, y: -8, duration: 0.3, ease: 'power2.in' },
          'handoff',
        );
      }
      if (skip) timeline.to(skip, { autoAlpha: 0, duration: 0.2 }, 'handoff');
      if (ground) {
        timeline.to(
          ground,
          { autoAlpha: 0, scaleX: 0.4, duration: 0.5, ease: 'power2.in' },
          'handoff',
        );
      }

      timeline.to({}, { duration: 1.2 }, 'handoff');

      // After React re-renders a new pose, re-apply full stroke visibility
      // (drawSVG may leave new paths incomplete on pose swap).
      const strokeRefresh = gsap.ticker.add(() => {
        const figure = svg();
        if (!figure) return;
        gsap.set(gsap.utils.toArray('path, circle', figure), {
          clearProps: 'strokeDasharray,strokeDashoffset',
        });
      });
      // Only need a few frames after each pose swap — kill after intro
      gsap.delayedCall(0.05, () => gsap.ticker.remove(strokeRefresh));

      const skipIntro = () => {
        if (finished.current) return;
        bobTween?.kill();
        const mascot = heroMascot();
        if (mascot) {
          gsap.set(actor, { autoAlpha: 0 });
          gsap.set(mascot, { autoAlpha: 1 });
          releaseHero(true);
        } else {
          releaseHero(false);
        }
        timeline?.progress(1);
      };

      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          skipIntro();
        }
      };

      skip?.addEventListener('click', skipIntro);
      window.addEventListener('keydown', onKey);

      return () => {
        bobTween?.kill();
        timeline?.kill();
        gsap.ticker.remove(strokeRefresh);
        skip?.removeEventListener('click', skipIntro);
        window.removeEventListener('keydown', onKey);
      };
    },
    { scope: root, dependencies: [] },
  );

  // Re-draw strokes cleanly when pose swaps mid-timeline
  useGSAP(
    () => {
      const actor = actorRef.current;
      if (!actor) return;
      const figure = actor.querySelector('.stickman');
      if (!figure) return;
      gsap.set(gsap.utils.toArray('path, circle', figure), {
        clearProps: 'strokeDasharray,strokeDashoffset',
      });
    },
    { dependencies: [pose, emotion], scope: actorRef },
  );

  return createPortal(
    <div
      className="intro-cutscene"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Intro cutscene"
    >
      <div className="intro-stage" data-intro-stage>
        <div className="intro-ground" data-intro-ground aria-hidden />
        <div className="intro-actor" ref={actorRef} data-intro-actor>
          <Stickman pose={pose} emotion={emotion} className="intro-stickman" />
        </div>
      </div>

      <p className="intro-cutscene-caption" data-intro-caption>
        …
      </p>
      <button type="button" className="intro-cutscene-skip" data-intro-skip>
        skip
      </button>
    </div>,
    document.body,
  );
}
