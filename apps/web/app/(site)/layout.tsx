import { Suspense } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { PublicRouteMotion } from '@/components/motion/PublicRouteMotion';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SiteFrame>{children}</SiteFrame>}>
      <PublicRouteMotion>
        <SiteFrame>{children}</SiteFrame>
      </PublicRouteMotion>
    </Suspense>
  );
}

function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
