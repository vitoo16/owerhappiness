import Link from 'next/link';
import type { ProjectDto } from '@portfolio/contracts';
import { privateApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface ProjectsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const query = await searchParams;
  const params = buildQuery(query);
  const projects = await privateApi<ProjectDto[]>(`/admin/projects?${params}`);

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">CONTENT</p>
          <h1>Projects</h1>
        </div>
        <Link className="button small" href="/admin/projects/new">
          + New project
        </Link>
      </header>

      <form className="admin-filters" method="get">
        <input
          name="q"
          defaultValue={query.q ?? ''}
          placeholder="Search title or summary…"
          aria-label="Search projects"
        />
        <select
          name="status"
          defaultValue={query.status ?? ''}
          aria-label="Project status"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <select name="type" defaultValue={query.type ?? ''} aria-label="Project type">
          <option value="">All types</option>
          <option value="DEVELOPMENT">DEVELOPMENT</option>
          <option value="DESIGN">DESIGN</option>
          <option value="HYBRID">HYBRID</option>
        </select>
        <button className="ghost-button">filter</button>
        <Link href="/admin/projects" className="ghost-button">
          reset
        </Link>
      </form>

      <div className="admin-table">
        <div className="table-head">
          <span>Project</span>
          <span>Type</span>
          <span>Status</span>
          <span>Year</span>
          <span />
        </div>
        {projects.map((project) => (
          <Link
            className="table-row"
            href={`/admin/projects/${project.id}`}
            key={project.id}
          >
            <div>
              <strong>{project.title}</strong>
              <small>/{project.slug}</small>
            </div>
            <span>{project.type}</span>
            <span className={`status ${project.status.toLowerCase()}`}>
              {project.status}
            </span>
            <span>{project.year}</span>
            <span>edit →</span>
          </Link>
        ))}
      </div>

      {!projects.length ? (
        <div className="admin-empty">
          <p>No matching projects.</p>
          <Link href="/admin/projects/new">Create a project →</Link>
        </div>
      ) : null}
    </div>
  );
}

function buildQuery(query: Awaited<ProjectsPageProps['searchParams']>) {
  const params = new URLSearchParams({ limit: '100' });
  if (query.q) params.set('q', query.q);
  if (query.status) params.set('status', query.status);
  if (query.type) params.set('type', query.type);
  return params;
}
