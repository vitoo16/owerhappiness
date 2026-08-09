import { z } from 'zod';

export const projectStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const projectTypeSchema = z.enum(['DEVELOPMENT', 'DESIGN', 'HYBRID']);
export const blockTypeSchema = z.enum([
  'HEADING',
  'PARAGRAPH',
  'IMAGE',
  'IMAGE_GROUP',
  'QUOTE',
  'VIDEO',
  'CODE',
  'TECH_CALLOUT',
]);

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectType = z.infer<typeof projectTypeSchema>;
export type BlockType = z.infer<typeof blockTypeSchema>;

const safeUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Only HTTP(S) URLs are allowed');

export const headingBlockContentSchema = z.object({
  level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().trim().min(1).max(240),
});

export const paragraphBlockContentSchema = z.object({
  text: z.string().trim().min(1).max(20_000),
});

export const imageBlockContentSchema = z.object({
  mediaAssetId: z.string().uuid(),
  caption: z.string().trim().max(500).optional(),
  altOverride: z.string().trim().max(500).optional(),
});

export const imageGroupBlockContentSchema = z.object({
  mediaAssetIds: z.array(z.string().uuid()).min(2).max(12),
  layout: z.enum(['two-column', 'gallery']),
  caption: z.string().trim().max(500).optional(),
});

export const quoteBlockContentSchema = z.object({
  text: z.string().trim().min(1).max(2_000),
  attribution: z.string().trim().max(240).optional(),
});

export const videoBlockContentSchema = z
  .object({
    provider: z.enum(['youtube', 'vimeo']),
    url: safeUrl,
    caption: z.string().trim().max(500).optional(),
  })
  .superRefine((value, context) => {
    let host = '';
    try {
      host = new URL(value.url).hostname.toLowerCase();
    } catch {
      return;
    }

    const allowedHosts =
      value.provider === 'youtube'
        ? ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']
        : ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];

    if (!allowedHosts.includes(host)) {
      context.addIssue({
        code: 'custom',
        path: ['url'],
        message: `URL does not match the selected ${value.provider} provider.`,
      });
    }
  });

export const codeBlockContentSchema = z.object({
  language: z.string().trim().min(1).max(40),
  code: z.string().min(1).max(30_000),
  caption: z.string().trim().max(500).optional(),
});

export const techCalloutBlockContentSchema = z.object({
  title: z.string().trim().min(1).max(240),
  body: z.string().trim().min(1).max(5_000),
  tags: z.array(z.string().trim().min(1).max(60)).max(16).default([]),
});

export const blockContentSchemas = {
  HEADING: headingBlockContentSchema,
  PARAGRAPH: paragraphBlockContentSchema,
  IMAGE: imageBlockContentSchema,
  IMAGE_GROUP: imageGroupBlockContentSchema,
  QUOTE: quoteBlockContentSchema,
  VIDEO: videoBlockContentSchema,
  CODE: codeBlockContentSchema,
  TECH_CALLOUT: techCalloutBlockContentSchema,
} as const;

export type BlockContentMap = {
  HEADING: z.infer<typeof headingBlockContentSchema>;
  PARAGRAPH: z.infer<typeof paragraphBlockContentSchema>;
  IMAGE: z.infer<typeof imageBlockContentSchema>;
  IMAGE_GROUP: z.infer<typeof imageGroupBlockContentSchema>;
  QUOTE: z.infer<typeof quoteBlockContentSchema>;
  VIDEO: z.infer<typeof videoBlockContentSchema>;
  CODE: z.infer<typeof codeBlockContentSchema>;
  TECH_CALLOUT: z.infer<typeof techCalloutBlockContentSchema>;
};

export function parseBlockContent<T extends BlockType>(type: T, value: unknown): BlockContentMap[T] {
  return blockContentSchemas[type].parse(value) as BlockContentMap[T];
}

export function validateBlockContent(type: BlockType, value: unknown) {
  return blockContentSchemas[type].safeParse(value);
}

export interface BlockMediaReference {
  mediaAssetId: string;
  altOverride?: string;
}

/**
 * Returns only semantic media references for a block. This intentionally avoids
 * scanning arbitrary strings so UUID-like text inside code/paragraph blocks is
 * never mistaken for an asset reference.
 */
export function blockMediaReferences(
  type: BlockType,
  value: unknown,
): BlockMediaReference[] {
  if (type === 'IMAGE') {
    const content = parseBlockContent('IMAGE', value);
    return [
      {
        mediaAssetId: content.mediaAssetId,
        ...(content.altOverride ? { altOverride: content.altOverride } : {}),
      },
    ];
  }

  if (type === 'IMAGE_GROUP') {
    const content = parseBlockContent('IMAGE_GROUP', value);
    return content.mediaAssetIds.map((mediaAssetId) => ({ mediaAssetId }));
  }

  // Parse non-media blocks too so callers may use this function as part of a
  // validation pass without accidentally accepting malformed content.
  parseBlockContent(type, value);
  return [];
}

export interface MediaAssetDto {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  altText: string;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
  deleteEligible?: boolean;
}

export interface ProjectBlockDto {
  id: string;
  projectId: string;
  type: BlockType;
  content: unknown;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  type: ProjectType;
  status: ProjectStatus;
  year: number;
  role: string;
  client: string | null;
  technologies: string[];
  services: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  behanceUrl: string | null;
  externalUrl: string | null;
  featured: boolean;
  sortOrder: number;
  coverOmitted: boolean;
  coverImage: MediaAssetDto | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetailDto extends ProjectDto {
  blocks: ProjectBlockDto[];
  media: MediaAssetDto[];
  galleryMediaIds: string[];
}

export interface MilestoneDto {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  visible: boolean;
  sortOrder: number;
  mediaAsset: MediaAssetDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaygroundItemDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  type: string;
  status: ProjectStatus;
  content: Record<string, unknown>;
  thumbnail: MediaAssetDto | null;
  liveUrl: string | null;
  sourceUrl: string | null;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerDto {
  id: string;
  email: string;
  role: 'OWNER';
}

export interface DashboardDto {
  projects: number;
  publishedProjects: number;
  draftProjects: number;
  milestones: number;
  playgroundItems: number;
  mediaAssets: number;
  recentProjects: ProjectDto[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown> | PageMeta;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export const publicSettingKeys = [
  'siteTitle',
  'siteDescription',
  'ownerName',
  'ownerHeadline',
  'ownerBio',
  'contactEmail',
  'githubUrl',
  'linkedinUrl',
  'upworkUrl',
  'defaultTheme',
  'heroEyebrow',
  'heroPrimary',
  'heroSecondary',
  'availability',
  'skills',
  'seoTitle',
  'seoDescription',
] as const;

export type PublicSettingKey = (typeof publicSettingKeys)[number];

export const settingSchemas: Record<PublicSettingKey, z.ZodType> = {
  siteTitle: z.string().trim().min(1).max(100),
  siteDescription: z.string().trim().min(1).max(300),
  ownerName: z.string().trim().min(1).max(100),
  ownerHeadline: z.string().trim().min(1).max(220),
  ownerBio: z.string().trim().min(1).max(2_000),
  contactEmail: z.string().email(),
  githubUrl: safeUrl,
  linkedinUrl: safeUrl,
  upworkUrl: safeUrl,
  defaultTheme: z.enum(['system', 'light', 'dark']),
  heroEyebrow: z.string().trim().min(1).max(100),
  heroPrimary: z.string().trim().min(1).max(120),
  heroSecondary: z.string().trim().min(1).max(120),
  availability: z.string().trim().max(200),
  skills: z.object({
    build: z.array(z.string().trim().min(1).max(60)).max(20),
    design: z.array(z.string().trim().min(1).max(60)).max(20),
    other: z.array(z.string().trim().min(1).max(60)).max(20),
  }),
  seoTitle: z.string().trim().min(1).max(100),
  seoDescription: z.string().trim().min(1).max(320),
};

export type SettingsMap = Partial<Record<PublicSettingKey, unknown>> & Record<string, unknown>;

export function isPublicSettingKey(value: string): value is PublicSettingKey {
  return (publicSettingKeys as readonly string[]).includes(value);
}

export function validateSetting(key: string, value: unknown) {
  if (!isPublicSettingKey(key)) {
    return { success: false as const, error: `Unknown setting key: ${key}` };
  }
  const result = settingSchemas[key].safeParse(value);
  if (!result.success) {
    return { success: false as const, error: result.error.issues[0]?.message ?? 'Invalid value' };
  }
  return { success: true as const, data: result.data };
}

export const utilityNamespaceSchema = z.string().regex(/^[a-z0-9-]{1,60}$/);
export const utilityKeySchema = z.string().regex(/^[a-z0-9-]{1,80}$/);
