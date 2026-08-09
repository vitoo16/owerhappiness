import path from 'node:path';
import dotenv from 'dotenv';
import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ProjectStatus, ProjectType, BlockType } from '../apps/api/src/generated/prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

function required(name: 'DATABASE_URL' | 'OWNER_EMAIL' | 'OWNER_PASSWORD') {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required to seed.`);
  return value;
}
const connectionString = required('DATABASE_URL');
const ownerEmail = required('OWNER_EMAIL').toLowerCase();
const ownerPassword = required('OWNER_PASSWORD');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedOwner() {
  const passwordHash = await argon2.hash(ownerPassword, { type: argon2.argon2id });

  return prisma.user.upsert({
    where: { email: ownerEmail },
    create: { email: ownerEmail, passwordHash, role: 'OWNER' },
    update: { passwordHash, role: 'OWNER' },
  });
}

async function seedProjects() {
  const vietBus = await prisma.project.upsert({
    where: { slug: 'vietbus-demo' },
    create: {
      title: 'VietBus — Demo',
      slug: 'vietbus-demo',
      summary: 'Demo full-stack bus booking case study. Replace this content from Admin.',
      description: 'Seeded demonstration content only; it is intentionally editable from the CMS.',
      type: ProjectType.DEVELOPMENT,
      status: ProjectStatus.PUBLISHED,
      year: 2026,
      role: 'Full-stack Developer',
      technologies: ['Next.js', 'NestJS', 'PostgreSQL', 'Prisma'],
      services: ['Product UI', 'API Design', 'Database Design'],
      featured: true,
      sortOrder: 10,
      coverOmitted: true,
      publishedAt: new Date(),
    },
    update: {},
  });

  await prisma.projectBlock.deleteMany({ where: { projectId: vietBus.id } });
  await prisma.projectBlock.createMany({
    data: [
      {
        projectId: vietBus.id,
        type: BlockType.HEADING,
        sortOrder: 10,
        content: { level: 2, text: 'The product problem' },
      },
      {
        projectId: vietBus.id,
        type: BlockType.PARAGRAPH,
        sortOrder: 20,
        content: {
          text: 'This is seeded demo content showing how a development case study is rendered from PostgreSQL instead of a page component.',
        },
      },
      {
        projectId: vietBus.id,
        type: BlockType.TECH_CALLOUT,
        sortOrder: 30,
        content: {
          title: 'Architecture direction',
          body: 'Next.js presentation, NestJS authoritative API, Prisma and PostgreSQL for durable content.',
          tags: ['Next.js', 'NestJS', 'Prisma', 'PostgreSQL'],
        },
      },
      {
        projectId: vietBus.id,
        type: BlockType.CODE,
        sortOrder: 40,
        content: {
          language: 'text',
          code: 'Admin → NestJS → PostgreSQL → Public Portfolio',
          caption: 'The same data path used by this portfolio itself.',
        },
      },
    ],
  });

  const sasa = await prisma.project.upsert({
    where: { slug: 'sa-sa-tole-demo' },
    create: {
      title: 'SA SA TOLE — Demo',
      slug: 'sa-sa-tole-demo',
      summary: 'Demo brand-identity case study for testing mixed design/development work.',
      description: 'Seeded demonstration content only; replace it with your real project in Admin.',
      type: ProjectType.DESIGN,
      status: ProjectStatus.PUBLISHED,
      year: 2026,
      role: 'Designer',
      client: 'Demo Client',
      technologies: [],
      services: ['Logo', 'Brand Identity', 'Price List', 'Poster', 'Thank-you Card'],
      featured: true,
      sortOrder: 20,
      coverOmitted: true,
      publishedAt: new Date(),
    },
    update: {},
  });

  await prisma.projectBlock.deleteMany({ where: { projectId: sasa.id } });
  await prisma.projectBlock.createMany({
    data: [
      {
        projectId: sasa.id,
        type: BlockType.HEADING,
        sortOrder: 10,
        content: { level: 2, text: 'Creative direction' },
      },
      {
        projectId: sasa.id,
        type: BlockType.PARAGRAPH,
        sortOrder: 20,
        content: {
          text: 'A seeded design-project example used to prove that visual work and engineering work can coexist in the same editorial system.',
        },
      },
      {
        projectId: sasa.id,
        type: BlockType.QUOTE,
        sortOrder: 30,
        content: {
          text: 'Cute, imperfect, hand-drawn — but still calm enough for professional work.',
          attribution: 'Demo design principle',
        },
      },
    ],
  });
}

async function seedMilestones() {
  const entries = [
    {
      title: 'Started building things — Demo',
      description: 'Seed milestone. Edit or remove it from Admin.',
      date: new Date('2023-01-15T00:00:00.000Z'),
      type: 'LEARNING',
      visible: true,
      sortOrder: 10,
    },
    {
      title: 'First full-stack project — Demo',
      description: 'Seed milestone for validating the database-driven journey.',
      date: new Date('2024-06-01T00:00:00.000Z'),
      type: 'PROJECT',
      visible: true,
      sortOrder: 20,
    },
    {
      title: 'Design + code in one portfolio — Demo',
      description: 'Seed milestone. Replace with your real story.',
      date: new Date('2026-08-10T00:00:00.000Z'),
      type: 'MILESTONE',
      visible: true,
      sortOrder: 30,
    },
  ];

  const existing = await prisma.milestone.findMany({ where: { title: { endsWith: '— Demo' } } });
  if (existing.length === 0) {
    await prisma.milestone.createMany({ data: entries });
  }
}

async function seedPlayground() {
  const items = [
    {
      title: 'GSAP line experiment — Demo',
      slug: 'gsap-line-demo',
      summary: 'A small motion experiment used as seeded playground content.',
      type: 'MOTION',
      status: ProjectStatus.PUBLISHED,
      content: { note: 'Replace this seed item in Admin.' },
      sortOrder: 10,
      publishedAt: new Date(),
    },
    {
      title: 'Doodle component study — Demo',
      slug: 'doodle-study-demo',
      summary: 'A seeded visual experiment for the playful side of the portfolio.',
      type: 'DESIGN',
      status: ProjectStatus.PUBLISHED,
      content: { note: 'Replace this seed item in Admin.' },
      sortOrder: 20,
      publishedAt: new Date(),
    },
  ];

  for (const item of items) {
    await prisma.playgroundItem.upsert({
      where: { slug: item.slug },
      create: item,
      update: {},
    });
  }
}

async function seedSettings() {
  const settings: Record<string, unknown> = {
    siteTitle: 'THONG.',
    siteDescription: 'Designer-ish · Fullstack Developer · Freelancer',
    ownerName: 'Thông',
    ownerHeadline: 'I design things. I build things.',
    ownerBio: 'I spend most of my time somewhere between Figma and VS Code.',
    contactEmail: 'hello@example.com',
    githubUrl: 'https://github.com/',
    linkedinUrl: 'https://www.linkedin.com/',
    upworkUrl: 'https://www.upwork.com/',
    defaultTheme: 'system',
    heroEyebrow: "hello, i'm Thông.",
    heroPrimary: 'I DESIGN THINGS.',
    heroSecondary: 'I BUILD THINGS.',
    availability: 'Open to interesting freelance work.',
    skills: {
      build: ['Next.js', 'React', 'NestJS', 'Node.js', 'PostgreSQL'],
      design: ['Figma', 'Photoshop', 'Illustrator'],
      other: ['GSAP', 'Docker', 'REST APIs', 'System Design'],
    },
    seoTitle: 'Thông — Designer-ish & Full-stack Developer',
    seoDescription: 'A personal digital space for design, full-stack development, experiments and case studies.',
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: {} });
  }
}

async function main() {
  await seedOwner();
  await seedProjects();
  await seedMilestones();
  await seedPlayground();
  await seedSettings();
  console.log('Seed complete. Demo content is database-backed and editable in Admin.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
