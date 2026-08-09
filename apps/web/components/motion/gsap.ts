import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export { gsap, ScrollToPlugin, ScrollTrigger, useGSAP };
