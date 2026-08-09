import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireOwner } from '@/lib/api';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await requireOwner();
  if (!owner) redirect('/admin/login');

  return <AdminShell email={owner.email}>{children}</AdminShell>;
}
