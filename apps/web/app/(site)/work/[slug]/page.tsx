import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ProjectDetailDto } from '@portfolio/contracts';
import { CaseStudyRenderer } from '@/components/CaseStudyRenderer';
import { Stickman } from '@/components/Stickman';
import { ApiError } from '@/lib/api';
import { getPublishedProject } from '@/lib/server-data';

export const dynamic = 'force-dynamic';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getPublishedProject(slug);
    const canonical = `/work/${project.slug}`;
    const images = project.coverImage
      ? [
          {
            url: project.coverImage.url,
            width: project.coverImage.width ?? 1800,
            height: project.coverImage.height ?? 1100,
            alt: project.coverImage.altText || project.title,
          },
        ]
      : undefined;

    return {
      title: project.title,
      description: project.summary,
      alternates: { canonical },
      openGraph: {
        type: 'article',
        url: canonical,
        title: project.title,
        description: project.summary,
        images,
      },
      twitter: {
        card: images ? 'summary_large_image' : 'summary',
        title: project.title,
        description: project.summary,
        images: images?.map((image) => image.url),
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return { title: 'Project not found' };
    throw error;
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await loadPublishedProject(slug);
  const capabilities = project.type === 'DESIGN' ? project.services : project.technologies;
  const projectLinks = buildProjectLinks(project);

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
            {projectLinks.length ? (
              <div className="case-links" aria-label="Project links">
                {projectLinks.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                ))}
              </div>
            ) : null}
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
        {project.description ? <p className="case-description">{project.description}</p> : null}
        <CaseStudyRenderer blocks={project.blocks} media={project.media} />
      </div>

      <footer className="case-outro container">
        <Stickman pose="wave" />
        <div>
          <p className="hand-note">end of case study</p>
          {projectLinks.length ? (
            <div className="case-outro-links">
              {projectLinks.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.label} ↗
                </a>
              ))}
            </div>
          ) : null}
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
    return await getPublishedProject(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

function buildProjectLinks(project: ProjectDetailDto) {
  return [
    project.liveUrl ? { label: 'live project', href: project.liveUrl } : null,
    project.githubUrl ? { label: 'source code', href: project.githubUrl } : null,
    project.behanceUrl ? { label: 'Behance', href: project.behanceUrl } : null,
    project.externalUrl ? { label: 'project link', href: project.externalUrl } : null,
  ].filter((link): link is { label: string; href: string } => Boolean(link));
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
