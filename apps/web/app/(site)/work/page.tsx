import Link from 'next/link';
import type { ProjectDto } from '@portfolio/contracts';
import { ProjectEditorialCard } from '@/components/ProjectEditorialCard';
import { SectionLabel } from '@/components/SectionLabel';
import { publicApi } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Work' };

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const query = await searchParams;
  const typeSuffix = query.type ? `&type=${encodeURIComponent(query.type)}` : '';
  const projects = await publicApi<ProjectDto[]>(`/projects?limit=100${typeSuffix}`);

  return (
    <section className="page-shell section-paper">
      <div className="container">
        <SectionLabel index="WORK">SELECTED PROJECTS</SectionLabel>
        <header className="page-heading">
          <h1>
            work, made with
            <br />
            code &amp; curiosity.
          </h1>
          <p>Development, design, and the projects that live somewhere between.</p>
        </header>

        <nav className="filter-nav" aria-label="Project filter">
          <Link href="/work" aria-current={!query.type ? 'page' : undefined}>
            All
          </Link>
          <Link
            href="/work?type=DEVELOPMENT"
            aria-current={query.type === 'DEVELOPMENT' ? 'page' : undefined}
          >
            Development
          </Link>
          <Link
            href="/work?type=DESIGN"
            aria-current={query.type === 'DESIGN' ? 'page' : undefined}
          >
            Design
          </Link>
          <Link
            href="/work?type=HYBRID"
            aria-current={query.type === 'HYBRID' ? 'page' : undefined}
          >
            Hybrid
          </Link>
        </nav>

        <div className="project-list">
          {projects.map((project, index) => (
            <ProjectEditorialCard key={project.id} project={project} index={index} />
          ))}
        </div>
        {!projects.length && <p className="empty-copy">Nothing published in this category yet.</p>}
      </div>
    </section>
  );
}
