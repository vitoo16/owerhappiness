import Link from 'next/link';
import type { DeskOverviewDto } from '@portfolio/contracts';
import { DeskGreeting } from '@/components/desk/DeskGreeting';
import { Stickman } from '@/components/Stickman';
import { privateApi, requireOwner } from '@/lib/api';
import { getPublicSettings } from '@/lib/server-data';
import { textSetting } from '@/lib/settings';

export const metadata = { title: 'My Desk' };

export default async function DeskPage() {
  const [overview, owner, settings] = await Promise.all([
    privateApi<DeskOverviewDto>('/desk/overview'),
    requireOwner(),
    getPublicSettings().catch(() => ({})),
  ]);
  const ownerName = textSetting(settings, 'ownerName', owner?.email.split('@')[0] || 'Thông');

  return (
    <main className="desk-page">
      <header className="desk-welcome desk-overview-welcome">
        <DeskGreeting name={ownerName} />
        <div className="desk-welcome-character">
          <span className="hand-note">everything in its little place.</span>
          <Stickman pose="laptop" />
        </div>
      </header>

      <section className="desk-stat-grid" aria-label="Workspace overview">
        <DeskStat
          label="PROJECTS"
          value={overview.projects}
          detail={`${overview.publishedProjects} published · ${overview.draftProjects} drafts`}
          href="/admin/projects"
        />
        <DeskStat
          label="MILESTONES"
          value={overview.milestones}
          detail="your journey so far"
          href="/admin/milestones"
        />
        <DeskStat
          label="NOTES"
          value={overview.notes}
          detail="ideas worth keeping"
          href="/desk/notes"
        />
        <DeskStat
          label="SNIPPETS"
          value={overview.snippets}
          detail="reusable pieces"
          href="/desk/snippets"
        />
        <DeskStat
          label="BOOKMARKS"
          value={overview.bookmarks}
          detail="saved references"
          href="/desk/bookmarks"
        />
        <DeskStat
          label="UTILITIES"
          value={overview.utilities}
          detail="small tools, ready"
          href="/desk/tools"
        />
      </section>

      <section className="desk-home-grid">
        <div className="desk-home-panel">
          <span className="eyebrow">QUICK START</span>
          <h2>What do you need?</h2>
          <div className="desk-shortcuts">
            <Link href="/desk/tools#json">
              <span>01</span>
              <strong>Format JSON</strong>
              <em>clean a payload →</em>
            </Link>
            <Link href="/desk/snippets">
              <span>02</span>
              <strong>Find a snippet</strong>
              <em>reuse the good bits →</em>
            </Link>
            <Link href="/desk/notes">
              <span>03</span>
              <strong>Write a note</strong>
              <em>before it disappears →</em>
            </Link>
            <Link href="/desk/bookmarks">
              <span>04</span>
              <strong>Open bookmarks</strong>
              <em>back to the rabbit holes →</em>
            </Link>
          </div>
        </div>

        <aside className="desk-home-note">
          <Stickman pose="think" />
          <p className="hand-note">today's gentle reminder</p>
          <blockquote>Build the useful thing first. Make it charming second.</blockquote>
        </aside>
      </section>
    </main>
  );
}

function DeskStat({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
}) {
  return (
    <Link className="desk-stat" href={href}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
      <em aria-hidden>↗</em>
    </Link>
  );
}
