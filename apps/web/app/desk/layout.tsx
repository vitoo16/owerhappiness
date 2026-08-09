import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DeskNav } from '@/components/desk/DeskNav';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { RouteMotion } from '@/components/motion/RouteMotion';
import { requireOwner } from '@/lib/api';

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();
  if (!owner) {
    redirect('/admin/login?next=/desk');
  }

  return (
    <RouteMotion variant="desk">
      <div className="desk-layout">
        <aside className="desk-sidebar">
          <div>
            <Link href="/desk" className="brand">
              THONG<span>.</span>
            </Link>
            <p>my private corner</p>
          </div>
          <DeskNav />
          <div className="desk-account">
            <small>{owner.email}</small>
            <LogoutButton />
          </div>
        </aside>

        <div className="desk-main">
          <header className="desk-header">
            <span className="desk-breadcrumb">MY SPACE / PRIVATE</span>
            <nav aria-label="Workspace shortcuts">
              <Link href="/admin">CMS</Link>
              <Link href="/" target="_blank" rel="noreferrer">
                public site ↗
              </Link>
              <ThemeToggle />
            </nav>
          </header>
          {children}
        </div>
      </div>
    </RouteMotion>
  );
}
