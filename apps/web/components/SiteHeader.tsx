'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP } from './motion/gsap';
import { ThemeToggle } from './ThemeToggle';

const navigation = [
  ['work', '/work'],
  ['journey', '/journey'],
  ['playground', '/playground'],
  ['about', '/about'],
  ['hello', '/contact'],
] as const;

export function SiteHeader() {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useGSAP(
    () => {
      const element = root.current;
      if (!element || !mobileOpen) return;

      const media = gsap.matchMedia();
      media.add('(max-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
        const links = gsap.utils.toArray<HTMLElement>('.mobile-site-nav nav > a');
        const themeRow = element.querySelector<HTMLElement>('.mobile-theme-row');
        const targets = themeRow ? [...links, themeRow] : links;
        const timeline = gsap.timeline({
          defaults: { duration: 0.42, ease: 'power3.out' },
          onComplete: () => gsap.set(targets, { clearProps: 'opacity,visibility,transform' }),
        });

        timeline.addLabel('menu', 0).from(links, { autoAlpha: 0, x: 18, stagger: 0.045 }, 'menu');
        if (themeRow) {
          timeline.from(themeRow, { autoAlpha: 0, y: 10 }, 'menu+=0.18');
        }
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [mobileOpen], revertOnUpdate: true },
  );

  return (
    <header className="site-header" ref={root}>
      <Link href="/" className="brand" aria-label="THONG home" onClick={() => setMobileOpen(false)}>
        THONG<span>.</span>
      </Link>

      <nav className="desktop-site-nav" aria-label="Primary">
        {navigation.map(([label, href]) => (
          <Link key={href} href={href} aria-current={isActive(pathname, href) ? 'page' : undefined}>
            {label}
          </Link>
        ))}
        <Link href="/desk" className="desk-link">
          desk
        </Link>
        <ThemeToggle />
      </nav>

      <details
        className="mobile-site-nav"
        open={mobileOpen}
        onToggle={(event) => setMobileOpen(event.currentTarget.open)}
      >
        <summary aria-label="Open navigation">
          <span>menu</span>
          <i aria-hidden>+</i>
        </summary>
        <nav aria-label="Mobile primary">
          {navigation.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {label}
            </Link>
          ))}
          <Link href="/desk" onClick={() => setMobileOpen(false)}>
            <span>06</span>
            private desk
          </Link>
          <div className="mobile-theme-row">
            <span>theme</span>
            <ThemeToggle />
          </div>
        </nav>
      </details>
    </header>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
}
