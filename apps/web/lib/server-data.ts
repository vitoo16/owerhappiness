import 'server-only';
import { cache } from 'react';
import type { SettingsMap } from '@portfolio/contracts';
import { publicApi } from './api';

export const getPublicSettings = cache(() =>
  publicApi<SettingsMap>('/settings/public'),
);
