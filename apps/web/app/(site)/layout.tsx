import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { RouteMotion } from '@/components/motion/RouteMotion';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteMotion variant="public">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </RouteMotion>
  );
}
