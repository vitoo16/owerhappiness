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

export type StickEmotion =
  | 'neutral'
  | 'happy'
  | 'curious'
  | 'shocked'
  | 'proud'
  | 'sleepy'
  | 'focused';

type StickmanProps = SVGProps<SVGSVGElement> & {
  pose?: StickPose;
  /** Optional face override; defaults from pose. */
  emotion?: StickEmotion;
  label?: string;
};

/**
 * Hand-drawn stickman — each pose uses authored arm/leg paths so limbs
 * stay attached to the body and never “orbit” through the face.
 */
export function Stickman({
  pose = 'idle',
  emotion,
  className = '',
  label,
  ...props
}: StickmanProps) {
  const face = emotion ?? emotionForPose(pose);
  const arms = getArms(pose);
  const legs = getLegs(pose);

  return (
    <svg
      className={`stickman ${className}`}
      viewBox="0 0 140 240"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-stick-pose={pose}
      data-stick-emotion={face}
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head */}
        <path d="M43 27 Q65 12 88 27 Q104 38 99 64 Q95 83 72 88 Q48 91 36 73 Q25 56 32 40 Q35 33 43 27Z" />
        <path d="M47 13 q8 -1 12 -7" />

        {/* Eyes */}
        {face === 'sleepy' ? (
          <>
            <path d="M48 56 q8 4 14 0" strokeWidth="3" />
            <path d="M72 54 q8 4 14 0" strokeWidth="3" />
          </>
        ) : face === 'shocked' ? (
          <>
            <circle cx="54" cy="55" r="5" />
            <circle cx="78" cy="54" r="5" />
          </>
        ) : (
          <>
            <path d="M54 46 q2 13 -2 21" strokeWidth="6" />
            <path d="M78 44 q2 13 -1 22" strokeWidth="6" />
          </>
        )}

        {/* Mouth */}
        <Mouth face={face} />

        {/* Body */}
        <path d="M66 88 Q64 115 63 148" />

        {/* Pose-authored arms (never free-rotated) */}
        {arms}

        {/* Pose-authored legs */}
        {legs}

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
            {/* Thought bubble — sits to the upper-right of the head, not empty air */}
            <path d="M96 94 Q104 81 104 72" />
            <circle cx="110" cy="53" r="2" fill="currentColor" stroke="none" />
            <circle cx="118" cy="42" r="3.5" fill="none" />
          </>
        )}
        {pose === 'sleep' && <path d="M92 25 q8 -8 15 0 q-8 8 -15 16 h16" />}
      </g>

      {/* Accent shoes — follow the foot paths of the current pose */}
      <Shoes pose={pose} />
    </svg>
  );
}

function Mouth({ face }: { face: StickEmotion }) {
  switch (face) {
    case 'shocked':
      return <circle cx="63" cy="76" r="5" />;
    case 'sleepy':
      return <path d="M54 78 q9 -2 16 2" strokeWidth="2.5" />;
    case 'curious':
      return <path d="M56 74 q4 6 10 0" strokeWidth="2.5" />;
    case 'neutral':
    case 'focused':
      return <path d="M52 76 h14" strokeWidth="2.5" />;
    case 'proud':
      return <path d="M50 72 q10 12 20 0" strokeWidth="2.8" />;
    case 'happy':
    default:
      return <path d="M51 73 q7 8 15 1" strokeWidth="2.5" />;
  }
}

function getArms(pose: StickPose) {
  // All arms start at shoulders (~55/76, 84) and are drawn to stay clear of the face.
  switch (pose) {
    case 'wave':
      // Right arm raised OUT to the side/up — not across the face
      return (
        <>
          <path d="M55 84 Q42 102 40 120" />
          <path d="M76 84 Q98 70 112 48" />
          <path d="M112 48 q6 -8 12 2 m-10 2 q8 -6 10 4 m-8 0 q8 2 10 -6" strokeWidth="2.6" />
        </>
      );
    case 'celebrate':
      // Both arms fully up, clear of head
      return (
        <>
          <path d="M55 84 Q38 55 32 30" />
          <path d="M76 84 Q96 55 106 30" />
        </>
      );
    case 'point':
      // Point outward to the RIGHT (toward content when stickman sits on the left)
      return (
        <>
          <path d="M55 84 Q42 100 40 118" />
          <path d="M76 84 Q100 78 124 70" />
          <path d="M124 70 l14 -2" strokeWidth="2.8" />
        </>
      );
    case 'think':
      // Hand to chin — classic think, arm stays under the jawline
      return (
        <>
          <path d="M55 84 Q40 100 38 118" />
          <path d="M76 84 Q98 92 100 70 Q98 58 88 62" />
        </>
      );
    case 'draw':
      // Drawing arm extended down-right toward work
      return (
        <>
          <path d="M55 84 Q42 100 40 118" />
          <path d="M76 84 Q96 100 108 122" />
        </>
      );
    case 'laptop':
      // Both arms toward keyboard area
      return (
        <>
          <path d="M55 84 Q48 102 50 120" />
          <path d="M76 84 Q88 102 90 120" />
        </>
      );
    case 'walk':
      // Opposite arm/leg swing, arms away from head
      return (
        <>
          <path d="M55 84 Q40 95 34 115" />
          <path d="M76 84 Q94 100 100 120" />
        </>
      );
    case 'sleep':
      return (
        <>
          <path d="M55 84 Q40 95 36 108" />
          <path d="M76 84 Q94 95 100 108" />
        </>
      );
    case 'idle':
    default:
      return (
        <>
          <path d="M55 84 Q42 100 40 118" />
          <path d="M76 84 Q92 100 98 118" />
        </>
      );
  }
}

function getLegs(pose: StickPose) {
  switch (pose) {
    case 'walk':
      return (
        <>
          <path d="M63 148 Q48 180 42 218" />
          <path d="M63 148 Q82 175 90 216" />
        </>
      );
    case 'celebrate':
      return (
        <>
          <path d="M63 148 Q50 182 46 220" />
          <path d="M63 148 Q78 182 84 220" />
        </>
      );
    default:
      return (
        <>
          <path d="M63 148 Q55 184 49 220" />
          <path d="M63 148 Q73 184 79 220" />
        </>
      );
  }
}

function Shoes({ pose }: { pose: StickPose }) {
  if (pose === 'walk') {
    return (
      <>
        <path
          d="M34 218 q10 -6 16 2"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M82 216 q10 -5 16 2"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      </>
    );
  }

  return (
    <>
      <path
        d="M41 220 q10 -7 17 1"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M72 221 q9 -6 17 2"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

function emotionForPose(pose: StickPose): StickEmotion {
  switch (pose) {
    case 'wave':
    case 'celebrate':
      return 'happy';
    case 'think':
    case 'draw':
    case 'laptop':
      return 'focused';
    case 'point':
      return 'curious';
    case 'sleep':
      return 'sleepy';
    default:
      return 'happy';
  }
}
