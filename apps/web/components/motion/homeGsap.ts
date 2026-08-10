'use client';

import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { gsap, ScrollToPlugin, ScrollTrigger, useGSAP } from './gsap';

gsap.registerPlugin(DrawSVGPlugin, SplitText);

export {
  DrawSVGPlugin,
  gsap,
  ScrollToPlugin,
  ScrollTrigger,
  SplitText,
  useGSAP,
};
