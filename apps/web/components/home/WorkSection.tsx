import Link from 'next/link';
import type { ProjectDto } from '@portfolio/contracts';
import { ProjectEditorialCard } from '@/components/ProjectEditorialCard';
import { SectionLabel } from '@/components/SectionLabel';
import { StorySection } from '@/components/motion/StorySection';

export function WorkSection({ projects }: { projects: ProjectDto[] }) {
  return (
    <StorySection className="section-paper" id="story-work" story="work">
      <SectionLabel>SELECTED WORK</SectionLabel>
      <div className="project-list">
        {projects.length ? (
          projects.map((project, index) => (
            <ProjectEditorialCard
              key={project.id}
              project={project}
              index={index}
              preload={false}
            />
          ))
        ) : (
          <p className="empty-copy">
            No published work yet. The owner can publish projects from Admin.
          </p>
        )}
      </div>
      <Link className="section-link" href="/work">
        view all work →
      </Link>
    </StorySection>
  );
}
