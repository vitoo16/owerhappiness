import Image from 'next/image';
import Link from 'next/link';
import type { ProjectDto } from '@portfolio/contracts';
import { Stickman } from './Stickman';

interface ProjectEditorialCardProps {
  project: ProjectDto;
  index: number;
}

export function ProjectEditorialCard({ project, index }: ProjectEditorialCardProps) {
  const href = `/work/${project.slug}`;
  const tags = [...project.technologies.slice(0, 5), ...project.services.slice(0, 3)];

  return (
    <article className={`project-editorial ${index % 2 ? 'reverse' : ''}`}>
      <div className="project-index">{String(index + 1).padStart(2, '0')}</div>

      <Link href={href} className="project-visual" aria-label={`View ${project.title}`}>
        {project.coverImage ? (
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.altText || project.title}
            fill
            sizes="(max-width: 900px) 92vw, 58vw"
            priority={index < 2}
          />
        ) : (
          <div className="project-placeholder">
            <Stickman pose={project.type === 'DESIGN' ? 'draw' : 'laptop'} />
            <span>{project.type.toLowerCase()}</span>
          </div>
        )}
      </Link>

      <div className="project-copy">
        <div className="project-meta">
          <span>{project.type.toLowerCase()}</span>
          <span>{project.year}</span>
        </div>

        <h3>
          <Link href={href}>{project.title}</Link>
        </h3>
        <p>{project.summary}</p>

        {tags.length ? (
          <div className="tags">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}

        <Link className="text-link" href={href}>
          explore project ↗
        </Link>
      </div>
    </article>
  );
}
