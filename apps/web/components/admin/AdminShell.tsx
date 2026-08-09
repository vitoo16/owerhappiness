import Link from 'next/link';
import { RouteMotion } from '@/components/motion/RouteMotion';
import { AdminNav } from './AdminNav';
import { LogoutButton } from './LogoutButton';

interface AdminShellProps {
  children: React.ReactNode;
  email: string;
}

export function AdminShell({ children, email }: AdminShellProps) {
  return (
    <RouteMotion variant="admin">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link className="brand" href="/admin">
            THONG<span>.</span>
          </Link>
          <p className="admin-caption">private creative desk</p>

          <AdminNav />

          <div className="admin-user">
            <small>{email}</small>
            <LogoutButton />
          </div>
        </aside>

        <main className="admin-main">{children}</main>
      </div>
    </RouteMotion>
  );
}
