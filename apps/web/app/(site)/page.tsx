import type { MilestoneDto, PlaygroundItemDto, ProjectDto } from '@portfolio/contracts';
import { AboutSection } from '@/components/home/AboutSection';
import { ContactSection } from '@/components/home/ContactSection';
import { HeroSection } from '@/components/home/HeroSection';
import { JourneySection } from '@/components/home/JourneySection';
import { PlaygroundSection } from '@/components/home/PlaygroundSection';
import { WorkSection } from '@/components/home/WorkSection';
import { LandingStory } from '@/components/motion/LandingStory';
import { publicApi } from '@/lib/api';
import { getPublicSettings } from '@/lib/server-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [settings, projects, milestones, playground] = await Promise.all([
    getPublicSettings(),
    publicApi<ProjectDto[]>('/projects?limit=6&featured=true'),
    publicApi<MilestoneDto[]>('/milestones'),
    publicApi<PlaygroundItemDto[]>('/playground'),
  ]);

  return (
    <LandingStory>
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <WorkSection projects={projects} />
      <JourneySection milestones={milestones} />
      <PlaygroundSection items={playground} />
      <ContactSection settings={settings} />
    </LandingStory>
  );
}
