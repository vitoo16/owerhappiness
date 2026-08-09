import type { SettingsMap } from '@portfolio/contracts';

interface SkillGroups {
  build: string[];
  design: string[];
  other: string[];
}

export function textSetting(
  settings: SettingsMap,
  key: string,
  fallback = '',
) {
  const value = settings[key];
  return typeof value === 'string' ? value : fallback;
}

export function skillsSetting(settings: SettingsMap): SkillGroups {
  const value = asRecord(settings.skills);

  return {
    build: stringArray(value.build),
    design: stringArray(value.design),
    other: stringArray(value.other),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}
