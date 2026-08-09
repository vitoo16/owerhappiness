import Link from 'next/link';
import { Stickman } from '@/components/Stickman';

export default function NotFoundPage() {
  return (
    <main className="center-state section-blush">
      <Stickman pose="think" />
      <p className="eyebrow">404 / LOST</p>
      <h1>nothing lives here.</h1>
      <Link className="button" href="/">
        take me home →
      </Link>
    </main>
  );
}
