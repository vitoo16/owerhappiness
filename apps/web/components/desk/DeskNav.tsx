'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  ['⌂', 'Overview', '/desk'],
  ['⌁', 'Utilities', '/desk/tools'],
  ['✎', 'Notes', '/desk/notes'],
  ['⌘', 'Snippets', '/desk/snippets'],
  ['↗', 'Bookmarks', '/desk/bookmarks'],
] as const;

export function DeskNav() {
  const pathname = usePathname();

  return (
    <nav className="desk-nav" aria-label="My Space">
      {items.map(([icon, label, href]) => {
        const active = href === '/desk' ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
            <span aria-hidden>{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
