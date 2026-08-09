'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNavigation = [
  ['⌂ Dashboard', '/admin'],
  ['▱ Projects', '/admin/projects'],
  ['○ Milestones', '/admin/milestones'],
  ['◇ Playground', '/admin/playground'],
  ['▧ Media', '/admin/media'],
  ['⚙ Settings', '/admin/settings'],
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin">
      {adminNavigation.map(([label, href]) => {
        const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
            {label}
          </Link>
        );
      })}
      <hr />
      <Link href="/desk">⌘ My Desk</Link>
      <Link href="/" target="_blank" rel="noreferrer">
        ↗ View Site
      </Link>
    </nav>
  );
}
