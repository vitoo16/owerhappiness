# Implementation Traceability — Local Complete

This file maps the supplied specification to implementation ownership. It does **not** replace the source SRS.

| Requirement area                       | Primary implementation                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Public portfolio / published filtering | `apps/web/app/(site)`, `apps/api/src/projects`, `milestones`, `playground`                                                       |
| Owner authentication / HttpOnly cookie | `apps/api/src/auth`, `apps/web/app/admin/login`, `apps/web/proxy.ts`                                                             |
| Projects CMS                           | `ProjectEditor`, `ProjectsTable`, `apps/api/src/projects`; CRUD, lifecycle, typed blocks and transactional ordering              |
| Case-study typed blocks                | `packages/contracts`, `ProjectEditor`, `CaseStudyRenderer`, `ProjectBlock` Prisma model                                          |
| Milestones / journey                   | `milestones` API, `MilestonesManager`, `JourneyTimeline`; transactional ordering and scroll-linked mascot                        |
| Playground                             | `playground` API + Admin manager + public lab page; CRUD and transactional ordering                                              |
| Local media                            | `media` API, `LocalStorageService`, `MediaManager`, `MediaAsset`                                                                 |
| Site settings                          | `settings` API, explicit dirty-state `SettingsEditor`, public settings consumers                                                 |
| Private My Space                       | `/desk` dashboard and route modules for tools, notes, snippets and bookmarks; protected Desk service + `UtilityData` persistence |
| Desk utilities                         | Browser-local JSON/JWT/UUID/time/Regex/URL/Base64/color tools; no token or utility input persistence                             |
| Light / dark theme                     | CSS semantic tokens + `ThemeToggle` + prepaint script                                                                            |
| GSAP / reduced motion                  | lazy ScrollTrigger initialization, fade/push chapters, ScrollTo navigation, deferred Journey chunk, reduced-motion fallback      |
| Responsive navigation                  | Complete public mobile menu plus scrollable full CMS navigation                                                                  |
| SEO / sharing                          | root and project metadata, canonical URLs, `opengraph-image.tsx`, robots and sitemap                                             |
| Validation                             | class-validator DTO boundary + Zod shared block/settings schemas                                                                 |
| Database integrity                     | `prisma/schema.prisma` + committed initial migration                                                                             |
| API error/success contract             | global envelope interceptor + exception filter                                                                                   |
| Security                               | server auth/owner guards, origin guard, HttpOnly sessions, Helmet, upload restrictions                                           |
| Local bootstrap                        | root scripts, Docker Compose PostgreSQL, README                                                                                  |
| Verification assets                    | Existing API specs and Playwright scenarios remain available; they were not executed in this delivery by user request            |

## Architectural boundaries enforced

- `apps/web` has no Prisma import.
- Public pages do not directly access PostgreSQL.
- Public project queries enforce `PUBLISHED`; journey enforces `visible`.
- Admin/Desk mutations are protected by server-side authentication and authorization.
- Admin resource identifiers pass through Nest UUID pipes; referenced media is checked before writes.
- Project, milestone and playground ordering validates a complete ID set and commits in a Prisma transaction.
- Case studies are typed structured blocks, not arbitrary raw HTML.
- Local media uses generated storage keys; public JSON exposes stable `/uploads/*` URLs, not host paths.
- Production topology remains outside the Local Complete implementation.
