import 'server-only';
import { cache } from 'react';
import type { ProjectDetailDto, SettingsMap } from '@portfolio/contracts';
import { publicApi } from './api';

export const getPublicSettings = cache(() => publicApi<SettingsMap>('/settings/public'));

export const getPublishedProject = cache((slug: string) =>
  publicApi<ProjectDetailDto>(`/projects/${encodeURIComponent(slug)}`),
);
