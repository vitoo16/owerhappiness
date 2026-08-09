import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProjectDetailDto } from '@portfolio/contracts';
import { CaseStudyRenderer } from '@/components/CaseStudyRenderer';
import { Stickman } from '@/components/Stickman';
import { ApiError, publicApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await loadPublishedProject(slug);
  const capabilities =
    project.type === 'DESIGN' ? project.services : project.technologies;

  return (
    <article className="case-page section-paper">
      <header className="case-hero container">
        <Link href="/work" className="text-link">
          ← all work
        </Link>

        <div className="case-title-grid">
          <div>
            <span className="eyebrow">
              {project.type} · {project.year}
            </span>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
          </div>
          <Stickman pose={project.type === 'DESIGN' ? 'draw' : 'laptop'} />
        </div>

        <dl className="case-meta">
          <Meta label="ROLE" value={project.role} />
          {project.client ? <Meta label="CLIENT" value={project.client} /> : null}
          <Meta label="YEAR" value={String(project.year)} />
          <Meta
            label={project.type === 'DESIGN' ? 'SERVICES' : 'STACK'}
            value={capabilities.join(' · ') || '—'}
          />
        </dl>

        {project.coverImage ? (
          <figure className="case-cover">
            <Image
              src={project.coverImage.url}
              alt={project.coverImage.altText || project.title}
              width={project.coverImage.width ?? 1800}
              height={project.coverImage.height ?? 1100}
              sizes="100vw"
              priority
            />
          </figure>
        ) : null}
      </header>

      <div className="case-body container">
        <CaseStudyRenderer blocks={project.blocks} media={project.media} />
      </div>

      <footer className="case-outro container">
        <Stickman pose="wave" />
        <div>
          <p className="hand-note">end of case study</p>
          <Link className="button" href="/work">
            see another project →
          </Link>
        </div>
      </footer>
    </article>
  );
}

async function loadPublishedProject(slug: string) {
  try {
    return await publicApi<ProjectDetailDto>(
      `/projects/${encodeURIComponent(slug)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
