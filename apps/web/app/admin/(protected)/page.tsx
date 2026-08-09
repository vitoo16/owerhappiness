import Link from 'next/link';
import type { DashboardDto } from '@portfolio/contracts';
import { privateApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const dashboard = await privateApi<DashboardDto>('/admin/dashboard');

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">PRIVATE / CMS</p>
          <h1>Dashboard</h1>
        </div>
        <Link className="button small" href="/admin/projects/new">
          + New project
        </Link>
      </header>

      <div className="stat-grid">
        <Stat label="PROJECTS" value={dashboard.projects} />
        <Stat label="PUBLISHED" value={dashboard.publishedProjects} />
        <Stat label="DRAFTS" value={dashboard.draftProjects} />
        <Stat label="MILESTONES" value={dashboard.milestones} />
        <Stat label="PLAYGROUND" value={dashboard.playgroundItems} />
        <Stat label="MEDIA" value={dashboard.mediaAssets} />
      </div>

      <section className="admin-panel">
        <div className="panel-title">
          <h2>Recently edited</h2>
          <Link href="/admin/projects">all projects →</Link>
        </div>

        {dashboard.recentProjects.map((project) => (
          <Link
            className="recent-row"
            key={project.id}
            href={`/admin/projects/${project.id}`}
          >
            <strong>{project.title}</strong>
            <span className={`status ${project.status.toLowerCase()}`}>
              {project.status}
            </span>
            <time dateTime={project.updatedAt}>
              {new Date(project.updatedAt).toLocaleDateString()}
            </time>
            <span>→</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
