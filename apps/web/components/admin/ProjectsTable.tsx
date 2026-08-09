'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProjectDto } from '@portfolio/contracts';
import { api, ClientApiError } from '@/lib/client-api';

export function ProjectsTable({
  initial,
  canReorder,
}: {
  initial: ProjectDto[];
  canReorder: boolean;
}) {
  const [projects, setProjects] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    const project = projects[index];
    const target = projects[targetIndex];
    if (!canReorder || !project || !target || project.featured !== target.featured) return;

    const previous = projects;
    const next = [...projects];
    [next[index], next[targetIndex]] = [target, project];
    setProjects(next.map((item, sortOrder) => ({ ...item, sortOrder })));
    setBusy(true);
    setMessage('');
    setError('');

    try {
      await api('/admin/projects/order', {
        method: 'PUT',
        body: JSON.stringify({ projectIds: next.map((item) => item.id) }),
      });
      setMessage('Project order updated.');
    } catch (cause) {
      setProjects(previous);
      setError(cause instanceof ClientApiError ? cause.message : 'Could not reorder projects.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!canReorder && projects.length ? (
        <p className="admin-hint">Clear filters to reorder the full project list.</p>
      ) : null}
      {message ? (
        <p className="form-success" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-table projects-table">
        <div className="table-head">
          <span>Project</span>
          <span>Type</span>
          <span>Status</span>
          <span>Year</span>
          <span>Order</span>
        </div>
        {projects.map((project, index) => {
          const before = projects[index - 1];
          const after = projects[index + 1];
          return (
            <div className="table-row" key={project.id}>
              <Link className="table-project-link" href={`/admin/projects/${project.id}`}>
                <strong>{project.title}</strong>
                <small>/{project.slug}</small>
              </Link>
              <span>{project.type}</span>
              <span className={`status ${project.status.toLowerCase()}`}>{project.status}</span>
              <span>{project.year}</span>
              <div className="table-actions">
                <button
                  type="button"
                  disabled={busy || !canReorder || !before || before.featured !== project.featured}
                  onClick={() => void move(index, -1)}
                  aria-label={`Move ${project.title} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || !canReorder || !after || after.featured !== project.featured}
                  onClick={() => void move(index, 1)}
                  aria-label={`Move ${project.title} down`}
                >
                  ↓
                </button>
                <Link href={`/admin/projects/${project.id}`}>edit</Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
