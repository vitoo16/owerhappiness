import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

const adminNavigation = [
  ['⌂ Dashboard', '/admin'],
  ['▱ Projects', '/admin/projects'],
  ['○ Milestones', '/admin/milestones'],
  ['◇ Playground', '/admin/playground'],
  ['▧ Media', '/admin/media'],
  ['⚙ Settings', '/admin/settings'],
] as const;

interface AdminShellProps {
  children: React.ReactNode;
  email: string;
}

export function AdminShell({ children, email }: AdminShellProps) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="brand" href="/admin">
          THONG<span>.</span>
        </Link>
        <p className="admin-caption">private creative desk</p>

        <nav aria-label="Admin">
          {adminNavigation.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
          <hr />
          <Link href="/desk">⌘ My Desk</Link>
          <Link href="/" target="_blank" rel="noreferrer">
            ↗ View Site
          </Link>
        </nav>

        <div className="admin-user">
          <small>{email}</small>
          <LogoutButton />
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
