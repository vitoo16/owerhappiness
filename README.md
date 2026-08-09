# THONG. — Interactive Full-stack Portfolio

Local-first implementation of the portfolio specification in `docs/reference/`.

## What is included

- **Public portfolio:** `/`, `/work`, `/work/[slug]`, `/journey`, `/playground`, `/about`, `/contact`
- **Owner CMS:** `/admin`, projects, milestones, playground, media, settings, case-study block builder
- **Private Desk:** `/desk` with JSON formatter, JWT decoder, UUID generator, timestamp converter and persisted scratch notes
- **API:** NestJS REST API with owner authentication, HttpOnly session cookie, server-side guards, validation and consistent response envelopes
- **Data:** PostgreSQL + Prisma migrations/seed; public content is database-driven
- **Media:** local image storage, safe generated paths, JPEG/PNG/WebP validation, Sharp normalization to WebP, metadata in PostgreSQL, reference-aware deletion
- **Motion:** GSAP + ScrollTrigger only for storytelling/reveal layers, plus `prefers-reduced-motion`
- **Themes:** blush/cream editorial light theme and dusty-plum dark theme
- **Quality:** strict TypeScript configuration, API unit tests, Playwright smoke/E2E scenarios, static architecture audit

Production deployment, domain, Cloudflare and the home server are deliberately not implemented in this milestone.

## Architecture

```text
Browser :3000
    │
    ▼
Next.js App Router
(public + admin + desk)
    │ HTTP/JSON
    ▼
NestJS :4000
    ├── Auth / CMS / Desk
    ├── local media abstraction
    └── Prisma
          │
          ▼
PostgreSQL :5432 (Docker, localhost only)
```

The web application never imports Prisma/database code. Public routes query only published/visible content through NestJS.

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker Desktop / Docker Engine with Compose

## First local bootstrap

```bash
# 1) Install dependencies
corepack enable
pnpm install

# 2) Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# IMPORTANT: edit apps/api/.env
# - set OWNER_EMAIL
# - set a strong OWNER_PASSWORD
# - replace JWT_SECRET with a long random value

# 3) Start PostgreSQL only
docker compose -f docker-compose.local.yml up -d postgres

# 4) Generate client + apply committed migration + seed database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5) Run contracts + API + web in watch mode
pnpm dev
```

Open:

- Portfolio: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Desk: `http://localhost:3000/desk`
- API: `http://localhost:4000/api`
- Swagger (development): `http://localhost:4000/api/docs`
- PostgreSQL: `localhost:5432`

Sign in with `OWNER_EMAIL` / `OWNER_PASSWORD` from `apps/api/.env`.

## Daily development

```bash
docker compose -f docker-compose.local.yml up -d postgres
pnpm dev
```

## Quality commands

```bash
pnpm audit:architecture
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build

# Full gate
pnpm check
```

Playwright expects the app to already be running. To use custom test credentials:

```bash
E2E_OWNER_EMAIL=... E2E_OWNER_PASSWORD=... pnpm test:e2e
```

## Content flow

```text
Admin editor
   │
   ├── project metadata
   ├── media
   └── structured case-study blocks
   │
   ▼
NestJS validation + authorization
   │
   ▼
PostgreSQL / local media
   │
   ▼
Published public query
   │
   ▼
Next.js public case study
```

No source edit or reseed is needed for normal project/milestone/playground/settings changes.

## Case-study blocks

V1 supports:

- Heading
- Paragraph
- Image
- Image group
- Quote
- Video / safe embed
- Code
- Technical callout

Blocks are stored as ordered typed JSON payloads and validated against discriminated schemas in `@portfolio/contracts`. Admin preview uses the same `CaseStudyRenderer` as public project pages.

## Local media

Uploaded bytes live under:

```text
local-data/uploads/media/
```

Only the `.gitkeep` is tracked. The database stores logical keys/metadata, never arbitrary client filesystem paths.

## Source-of-truth hierarchy

1. SRS requirement IDs in the supplied engineering docs
2. `prisma/schema.prisma` for implemented database structure
3. NestJS controllers/Swagger for implemented HTTP behavior
4. `packages/contracts` for shared block/settings validation
5. UI/UX specification for visual/motion behavior

See `docs/IMPLEMENTATION_TRACEABILITY.md` for code ownership.
