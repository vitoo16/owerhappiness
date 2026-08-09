import type { MetadataRoute } from 'next';
import type { ProjectDto } from '@portfolio/contracts';
import { publicApi } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const staticRoutes = ['', '/work', '/journey', '/playground', '/about', '/contact'];
  const projects = await loadProjects();

  return [
    ...staticRoutes.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
    })),
    ...projects.map((project) => ({
      url: `${baseUrl}/work/${project.slug}`,
      lastModified: new Date(project.updatedAt),
    })),
  ];
}

async function loadProjects() {
  try {
    return await publicApi<ProjectDto[]>('/projects?limit=100');
  } catch {
    // A sitemap should still be available while the API is temporarily down.
    return [];
  }
}
