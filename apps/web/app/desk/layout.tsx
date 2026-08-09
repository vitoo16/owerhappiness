import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { requireOwner } from '@/lib/api';

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();
  if (!owner) {
    redirect('/admin/login?next=/desk');
  }

  return (
    <div className="desk-layout">
      <header className="desk-header">
        <Link href="/" className="brand">
          THONG<span>.</span>
        </Link>
        <nav aria-label="Private desk">
          <Link href="/admin">CMS</Link>
          <Link href="/">public site ↗</Link>
          <ThemeToggle />
        </nav>
      </header>
      {children}
    </div>
  );
}
