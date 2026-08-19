'use client';

import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { gsap, ScrollToPlugin, ScrollTrigger, useGSAP } from './gsap';

gsap.registerPlugin(DrawSVGPlugin, Flip, SplitText);

export {
  DrawSVGPlugin,
  Flip,
  gsap,
  ScrollToPlugin,
  ScrollTrigger,
  SplitText,
  useGSAP,
};
