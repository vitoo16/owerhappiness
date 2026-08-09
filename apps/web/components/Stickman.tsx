import type { SVGProps } from 'react';

export type StickPose =
  | 'idle'
  | 'wave'
  | 'walk'
  | 'laptop'
  | 'draw'
  | 'celebrate'
  | 'point'
  | 'think'
  | 'sleep';

type StickmanProps = SVGProps<SVGSVGElement> & {
  pose?: StickPose;
  label?: string;
};

export function Stickman({
  pose = 'idle',
  className = '',
  label,
  ...props
}: StickmanProps) {
  const arms = getArms(pose);

  return (
    <svg
      className={`stickman ${className}`}
      viewBox="0 0 140 240"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M43 27 Q65 12 88 27 Q104 38 99 64 Q95 83 72 88 Q48 91 36 73 Q25 56 32 40 Q35 33 43 27Z" />
        <path d="M47 13 q8 -1 12 -7" />
        <path d="M54 46 q2 13 -2 21" strokeWidth="6" />
        <path d="M78 44 q2 13 -1 22" strokeWidth="6" />
        <path d="M51 73 q7 8 15 1" strokeWidth="2.5" />
        <path d="M66 88 Q64 115 63 148" />
        {arms}
        <path d="M63 148 Q55 184 49 220" />
        <path d="M63 148 Q73 184 79 220" />

        {pose === 'laptop' && (
          <>
            <path d="M43 108 h48 l-5 29 H47Z" />
            <path d="M47 137 h44" />
          </>
        )}
        {pose === 'draw' && (
          <>
            <path d="M98 108 l20 18" />
            <path d="M118 126 l6 5" />
          </>
        )}
        {pose === 'think' && (
          <>
            <path d="M96 94 Q104 81 104 72" />
            <circle cx="110" cy="53" r="2" fill="currentColor" stroke="none" />
          </>
        )}
        {pose === 'sleep' && <path d="M92 25 q8 -8 15 0 q-8 8 -15 16 h16" />}

        <path d="M41 220 q10 -7 17 1" />
        <path d="M72 221 q9 -6 17 2" />
      </g>

      <path
        d="M41 220 q10 -7 17 1"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M72 221 q9 -6 17 2"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getArms(pose: StickPose) {
  if (pose === 'wave') {
    return (
      <>
        <path d="M77 83 Q97 76 105 55" />
        <path d="M105 55 q5 -8 10 0 m-10 0 q-7 -5 -5 -11 m5 11 q10 0 13 -8" />
      </>
    );
  }

  if (pose === 'celebrate') {
    return (
      <>
        <path d="M76 82 Q97 62 104 40" />
        <path d="M54 82 Q35 63 29 42" />
      </>
    );
  }

  if (pose === 'point') {
    return (
      <>
        <path d="M76 84 Q97 80 112 68" />
        <path d="M112 68 l12 -2" />
      </>
    );
  }

  return (
    <>
      <path d="M76 84 Q92 92 99 110" />
      <path d="M55 84 Q45 97 44 112" />
    </>
  );
}
