import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const navigation = [
  ['work', '/work'],
  ['journey', '/journey'],
  ['playground', '/playground'],
  ['about', '/about'],
  ['hello', '/contact'],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="THONG home">
        THONG<span>.</span>
      </Link>

      <nav aria-label="Primary">
        {navigation.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
        <Link href="/desk" className="desk-link">
          desk
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
