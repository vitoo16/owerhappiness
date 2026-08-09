'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from './motion/gsap';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const button = useRef<HTMLButtonElement>(null);
  const { contextSafe } = useGSAP({ scope: button });

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const toggleTheme = contextSafe(() => {
    const nextTheme = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('portfolio-theme', nextTheme);
    setTheme(nextTheme);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const icon = button.current?.querySelector('span');
      if (icon) {
        gsap.fromTo(
          icon,
          { autoAlpha: 0.25, rotation: -75, scale: 0.65 },
          {
            autoAlpha: 1,
            rotation: 0,
            scale: 1,
            duration: 0.42,
            ease: 'back.out(2)',
            clearProps: 'opacity,visibility,transform',
          },
        );
      }
    }
  });

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className="icon-button"
      ref={button}
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title="Toggle theme"
    >
      <span aria-hidden>{theme === 'dark' ? '☀' : '◐'}</span>
    </button>
  );
}
