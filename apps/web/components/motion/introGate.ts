const INTRO_STORAGE_KEY = 'portfolio-intro-seen';
export const INTRO_COMPLETE_EVENT = 'portfolio:intro-complete';

export function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  try {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    // Private mode / blocked storage — still finish the cutscene once.
  }
}

export function announceIntroComplete() {
  markIntroSeen();
  document.documentElement.dataset.intro = 'done';
  document.documentElement.classList.remove('intro-active');
}

/** Kick the hero entrance. Pass seamless when the same stickman already lands in place. */
export function releaseIntroHero(options?: { seamless?: boolean }) {
  markIntroSeen();
  document.documentElement.dataset.intro = 'done';
  if (options?.seamless) {
    document.documentElement.dataset.introSeamless = '1';
  } else {
    delete document.documentElement.dataset.introSeamless;
  }
  window.dispatchEvent(new CustomEvent(INTRO_COMPLETE_EVENT));
}

export function lockIntroScroll() {
  document.documentElement.classList.add('intro-active');
  document.documentElement.dataset.intro = 'playing';
  delete document.documentElement.dataset.introSeamless;
}

export function isSeamlessIntroHandoff() {
  return document.documentElement.dataset.introSeamless === '1';
}
