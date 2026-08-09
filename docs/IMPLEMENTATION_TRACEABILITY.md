# Implementation Traceability — Local Complete

This file maps the supplied specification to implementation ownership. It does **not** replace the source SRS.

| Requirement area | Primary implementation |
|---|---|
| Public portfolio / published filtering | `apps/web/app/(site)`, `apps/api/src/projects`, `milestones`, `playground` |
| Owner authentication / HttpOnly cookie | `apps/api/src/auth`, `apps/web/app/admin/login`, `apps/web/proxy.ts` |
| Projects CMS | `apps/web/components/admin/ProjectEditor.tsx`, `apps/api/src/projects` |
| Case-study typed blocks | `packages/contracts`, `ProjectEditor`, `CaseStudyRenderer`, `ProjectBlock` Prisma model |
| Milestones / journey | `milestones` API, `MilestonesManager`, `JourneyTimeline` |
| Playground | `playground` API + Admin manager + public lab page |
| Local media | `media` API, `LocalStorageService`, `MediaManager`, `MediaAsset` |
| Site settings | `settings` API, `SettingsEditor`, public settings consumers |
| Private Desk | `apps/web/app/desk`, `DeskTools`, `/api/desk/*`, `UtilityData` |
| Light / dark theme | CSS semantic tokens + `ThemeToggle` + prepaint script |
| GSAP / reduced motion | `HeroMotion`, `Reveal`, `JourneyTimeline`, global reduced-motion CSS |
| Validation | class-validator DTO boundary + Zod shared block/settings schemas |
| Database integrity | `prisma/schema.prisma` + committed initial migration |
| API error/success contract | global envelope interceptor + exception filter |
| Security | server auth/owner guards, origin guard, HttpOnly sessions, Helmet, upload restrictions |
| Local bootstrap | root scripts, Docker Compose PostgreSQL, README |
| Tests | API unit specs + `tests/e2e/portfolio.spec.ts` |

## Architectural boundaries enforced

- `apps/web` has no Prisma import.
- Public pages do not directly access PostgreSQL.
- Public project queries enforce `PUBLISHED`; journey enforces `visible`.
- Admin/Desk mutations are protected by server-side authentication and authorization.
- Case studies are typed structured blocks, not arbitrary raw HTML.
- Local media uses generated storage keys; public JSON exposes stable `/uploads/*` URLs, not host paths.
- Production topology remains outside the Local Complete implementation.
