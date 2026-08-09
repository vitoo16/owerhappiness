import type { ProjectDetailDto } from '@portfolio/contracts';
import { ProjectEditor } from '@/components/admin/ProjectEditor';
import { privateApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await privateApi<ProjectDetailDto>(`/admin/projects/${id}`);

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">PROJECT / {project.status}</p>
          <h1>{project.title}</h1>
        </div>
        {project.status === 'PUBLISHED' ? (
          <a
            className="ghost-button"
            href={`/work/${project.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            public view ↗
          </a>
        ) : null}
      </header>

      <ProjectEditor initial={project} />
    </div>
  );
}
