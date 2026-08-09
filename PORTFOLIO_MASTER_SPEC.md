# THONG PORTFOLIO — MASTER PRODUCT / UI / ENGINEERING SPEC

> **Purpose:** Single source of truth for an AI coding agent implementing the portfolio. Treat this document as a product specification, art direction, UX spec, technical architecture, and phased implementation plan.
>
> The final website must be a real full-stack product with database-driven content, not a hardcoded static portfolio.

---

# 0. EXECUTIVE SUMMARY

Build a personal portfolio for an amateur designer, Upwork freelancer, and Fullstack Developer whose primary stack is Next.js / React / NestJS / Node.js / PostgreSQL.

The product contains **three connected experiences**:

1. **Public Portfolio** — personal brand, selected work, case studies, design projects, development projects, milestones/journey, playground, contact.
2. **Admin CMS** — owner-only dashboard used to manage projects, milestones, media, case studies, playground entries, and site settings.
3. **Private Desk** — owner-only utility workspace for personal tools, snippets, notes, and future mini-apps.

Public portfolio content must be driven by the backend/database wherever it is editable in Admin.

---

# 1. PRODUCT PHILOSOPHY

Do **not** build a generic developer portfolio template.

Avoid the usual pattern of a dark hero, technology icons, progress bars, glass cards, and corporate copy. The intended identity is:

> **Cute + imperfect + hand-drawn + editorial + technical + personal.**

Visual language inspired by the supplied stickman reference:

- pastel pink / peach backgrounds
- thin black hand-drawn line art
- simple stickman character
- intentionally imperfect doodles
- generous whitespace
- minimal accent colors
- clean editorial composition
- thin typography
- playful details without looking childish

Target balance:

```text
70% clean minimal editorial interface
30% doodle / character personality
```

The result should still feel professional enough for freelance clients, Upwork clients, recruiters, developers, and designers.

---

# 2. BRAND CHARACTER / MASCOT

Create an original reusable stickman mascot inspired by the reference, not a literal copy.

Characteristics:

- slightly imperfect circular head
- thin body strokes
- simple expressive face
- hand-drawn line quality
- expressive hands
- tiny accent-colored shoes or details
- very simple anatomy

The mascot becomes a storytelling device across the site.

Recommended poses:

```text
idle
wave
walk
type
draw
sit
sleep
celebrate
point
think
climb
confused
```

Implementation direction:

```text
SVG character
+
pose variants
+
GSAP animation
+
CSS transforms
```

Possible API later:

```tsx
<Stickman
  pose="wave"
  expression="happy"
  direction="right"
/>
```

The mascot should move more than the rest of the UI. The interface itself remains calm.

---

# 3. DESIGN SYSTEM

## 3.1 Visual principles

The interface should feel:

- soft
- thin
- airy
- calm
- slightly imperfect
- warm
- playful
- personal
- modern
- editorial

Avoid:

- glassmorphism everywhere
- neon gradients
- cyberpunk styling
- terminal clichés
- excessive black cards
- excessive shadows
- giant pill buttons
- generic Tailwind-template look
- technology-logo wallpaper

## 3.2 Light mode palette

Initial tokens:

```css
:root {
  --background: #F8CEDF;
  --surface: #FFF3F6;
  --text: #171417;
  --muted: #746A70;
  --line: #181418;
  --accent: #B86A38;
  --cream: #FFF4D8;
}
```

Do not use exactly the same pink on every section. Suggested rhythm:

```text
Hero        -> blush pink
About       -> pale cream
Projects    -> warm white
Journey     -> blush
Playground  -> pale peach
Contact     -> blush / cream
```

## 3.3 Dark mode palette

Do not convert the design to pure black. Use dusty plum / muted dark tones.

```css
[data-theme="dark"] {
  --background: #19151B;
  --surface: #241D26;
  --text: #F8EAF0;
  --muted: #A798A0;
  --line: #F5DFE8;
  --accent: #D79568;
}
```

Mascot strokes:

```text
Light -> near black
Dark  -> off white
```

Subtle transition:

```css
transition:
  background-color .4s ease,
  color .4s ease,
  border-color .4s ease;
```

---

# 4. TYPOGRAPHY

Typography is one of the main visual systems.

## Display / headline

Use a thin grotesk or geometric sans. It should be elegant, airy, and work well in uppercase.

## Body

Use a clean readable sans-serif for paragraphs, CMS, labels, and supporting content.

## Handwritten annotation

Use handwritten style only for small notes, arrows, doodle captions, mascot speech, or jokes.

Example:

```text
I DESIGN,
I DEVELOP,
I MAKE THINGS.

                ← sometimes they work.
```

Do **not** use handwritten fonts for large paragraphs.

---

# 5. MOTION SYSTEM — GSAP

Use GSAP + ScrollTrigger for purposeful storytelling.

## Core rule

Do not animate everything.

Bad pattern:

```text
every title fades
every image zooms
every card tilts
every button bounces
every section has parallax
```

Preferred philosophy:

> **The mascot moves a lot. The UI remains calm.**

## Tier 1 — Micro interactions

- link underline
- button hover
- theme toggle
- small cursor response
- tiny image movement
- subtle card tilt

## Tier 2 — Section motion

- text reveal
- image reveal
- metadata stagger
- SVG line drawing
- subtle parallax
- doodle stroke animation

## Tier 3 — Storytelling

Reserve for Hero, Selected Work, and Journey.

Possible mechanisms:

- `ScrollTrigger`
- `scrub`
- `pin`
- selective `snap`
- SVG path progress

Use animation only when it adds meaning or personality.

---

# 6. ROUTES / INFORMATION ARCHITECTURE

Public:

```text
/
/work
/work/[slug]
/journey
/playground
/about
/contact
```

Private:

```text
/admin
/admin/login
/admin/projects
/admin/projects/new
/admin/projects/[id]
/admin/milestones
/admin/playground
/admin/media
/admin/settings

/desk
/desk/*
```

---

# 7. HOMEPAGE FLOW

The homepage is an editorial scrolling story:

```text
Hero
↓
About
↓
Selected Work
↓
Journey
↓
Playground
↓
Contact
```

---

# 8. HERO

Suggested composition:

```text
THONG.                         work journey about desk ◐


hello, i'm Thông.

I DESIGN
THINGS.

I BUILD THINGS.                         \o
                                         |\
designer-ish / fullstack developer       / \


                       scroll ↓
```

Preferred copy direction:

```text
Hi, I'm Thông.

I design things.
I build things.

Designer-ish · Fullstack Developer · Freelancer
```

Avoid opening with a wall of tech-stack keywords.

Hero animation idea:

1. Name/logo enters.
2. Main statement reveals line by line.
3. Mascot waves.
4. Scroll hint appears.
5. Mascot begins moving with scroll toward the next section.

---

# 9. ABOUT

Section label:

```text
01 / ABOUT
```

Core idea:

```text
somewhere between

FIGMA

      and

                    VS CODE.
```

Possible support line:

> I spend most of my time somewhere between Figma and VS Code.

Visual:

```text
DESIGN      \o/      CODE
             |
            / \
```

Keep it sparse. Use typography + a small mascot action rather than a heavy card layout.

---

# 10. SELECTED WORK

Section label:

```text
02 / SELECTED WORK
```

Do not use generic equal-sized cards.

Prefer editorial layouts with alternating alignment.

Example:

```text
01

        ┌────────────────────────────┐
        │                            │
        │        PROJECT IMAGE       │
        │                            │
        └────────────────────────────┘

VietBus

Bus ticket booking platform.

Product Design
Next.js / NestJS / PostgreSQL

                                    ↗ explore project
```

Next project can reverse the composition:

```text
                         02

                    SA SA TOLE

             Brand Identity / Graphic Design


┌────────────────────────────┐
│                            │
│        DESIGN MOCKUP       │
│                            │
└────────────────────────────┘
```

Project types:

```text
DEVELOPMENT
DESIGN
HYBRID
```

This allows software and graphic-design work to coexist naturally.

Optional advanced desktop behavior:

```text
scroll ↓

PROJECT 01 ─────────→ PROJECT 02 ─────────→ PROJECT 03
```

Only use pinned horizontal storytelling if mobile gets a clean vertical fallback.

---

# 11. PROJECT CASE STUDIES

Route:

```text
/work/[slug]
```

Do not build a project page that contains only description, technologies, and GitHub.

## Design project structure

```text
SA SA TOLE
────────────────────────────

Brand identity for a Vietnamese
sleepwear / tole clothing shop.

ROLE
Designer

YEAR
2026

SERVICES
Brand identity
Logo
Price list
Packaging materials
Poster
```

Then:

```text
The problem
↓
Creative direction
↓
Logo exploration
↓
Color system
↓
Typography
↓
Final identity
↓
Mockups
↓
Deliverables
↓
What I learned
```

## Development project structure

```text
Problem
↓
Product idea
↓
My role
↓
Key screens
↓
Architecture
↓
Database
↓
Engineering decisions
↓
Technical challenges
↓
Result
↓
Things I would improve
```

The website should prove skill through evidence rather than generic self-description.

---

# 12. CASE STUDY BUILDER

Admin should eventually provide a block-based case-study editor.

Recommended blocks:

```text
Heading
Paragraph
Rich Text
Large Image
Image Grid
Two-column Images
Quote
Callout
Video
Code
Architecture Diagram
Tech Stack
Metrics
Gallery
Divider
Spacer
```

Suggested model:

```ts
ProjectBlock {
  id
  projectId
  type
  data
  sortOrder
  createdAt
  updatedAt
}
```

Capabilities:

- create
- edit
- delete
- drag/reorder
- preview
- publish

Start with a smaller useful block set and expand later.

---

# 13. JOURNEY / MILESTONES

Route:

```text
/journey
```

This should become a signature section.

Visual concept:

```text
                    o
                   /|\
                   / \
                    │
2022 ───────────────●
                    │
              Started coding
                    │
                    │
2023 ───────────────●
                    │
              First web project
                    │
                    │
2024 ───────────────●
                    │
              First freelance work
```

Scroll behavior:

```text
scroll progress
→ timeline path draw progress
→ mascot position
→ milestone reveal
```

Mascot poses may change between milestones: walking, sitting, climbing, celebrating, thinking, holding laptop, drawing.

---

# 14. PLAYGROUND / LAB

Route:

```text
/playground
```

Possible label:

> Things I made because I wanted to.

Examples:

```text
01  GSAP cursor experiment
02  CSS character animation
03  Three.js experiment
04  Weird React component
05  Logo exploration
06  Mini game
07  UI concept
```

This area should show curiosity and experimentation, not polished client work only.

Suggested fields:

```text
title
slug
description
type
thumbnail
liveUrl
githubUrl
content
published
sortOrder
```

---

# 15. SKILLS

Do not use percentage bars.

Never:

```text
React       █████████  90%
Node.js     ████████   80%
Figma       ███████    70%
```

Use calm typography:

```text
things I work with
────────────────────────

BUILD
Next.js
React
NestJS
Node.js
PostgreSQL

DESIGN
Figma
Photoshop
Illustrator

OTHER THINGS I LIKE
GSAP
Docker
REST APIs
System Design
```

Skills can live inside About rather than requiring a giant dedicated section.

---

# 16. CONTACT

Example:

```text
05 / SAY HELLO

                      \o/
                       |
                      / \

        have something interesting in mind?

             hello@xxxxxxxx.com

         Github · Upwork · LinkedIn
```

Keep it simple and memorable.

---

# 17. PRIVATE DESK

Route:

```text
/desk
```

Locked-state idea:

```text
┌────────────────────────────┐
│                            │
│          ( -_- )           │
│            /|\             │
│            / \             │
│                            │
│     this room is private.  │
│                            │
└────────────────────────────┘
```

Authenticated dashboard:

```text
Good evening, Thông.

Sunday
10 August 2026


┌───────────────┐ ┌───────────────┐
│ PROJECTS      │ │ MILESTONES    │
│      12       │ │      28       │
└───────────────┘ └───────────────┘

┌───────────────┐ ┌───────────────┐
│ NOTES         │ │ UTILITIES     │
│      42       │ │       8       │
└───────────────┘ └───────────────┘
```

Future utilities:

- JSON formatter
- UUID generator
- JWT decoder
- timestamp converter
- regex tester
- image compressor
- color tools
- API tester
- snippet manager
- bookmarks
- personal notes
- freelance tracker

Do not implement every utility in the first phase.

---

# 18. ADMIN CMS

Route:

```text
/admin
```

Admin should feel like a private creative workspace, not an enterprise template.

Sidebar concept:

```text
⌂ Dashboard

▱ Projects
○ Milestones
◇ Playground
▧ Media

✎ About
⚙ Site Settings

────────────

⌘ My Desk

────────────

Logout
```

Admin priorities:

1. usability
2. speed
3. information density
4. consistency

Keep animation minimal in CRUD screens.

---

# 19. ADMIN DASHBOARD

Example:

```text
Dashboard

Projects                 12
Published                 8
Draft                     4

Milestones               23

Media                    126

──────────────────────────────

Recently edited

SaSa Tole        2 minutes ago
VietBus          Yesterday
Pet Feeder       Aug 2
```

Eventually show project counts, drafts, published content, milestones, playground entries, media, and recent edits.

---

# 20. PROJECT CMS

Routes:

```text
/admin/projects
/admin/projects/new
/admin/projects/[id]
```

Fields:

```text
Title
Slug

Short description
Full description

Project type
○ Development
○ Design
○ Hybrid

Status
○ Draft
○ Published
○ Archived

Year
Cover image
Gallery
Role
Client
Technologies
Services
Github URL
Live URL
Behance URL
Featured project [✓]
Display order

──────────────────────
CASE STUDY
[ block editor ]
```

Homepage and work pages must query these records from the backend instead of hardcoding them.

---

# 21. MILESTONE CMS

Suggested model:

```ts
Milestone {
  id
  title
  description
  date
  year
  type
  icon
  media
  visible
  sortOrder
  createdAt
  updatedAt
}
```

Expected behavior:

```text
Create milestone
→ Save
→ Publish
→ Journey updates automatically
```

---

# 22. MEDIA SYSTEM

Recommended reusable entity:

```ts
MediaAsset {
  id
  filename
  originalName
  mimeType
  width
  height
  size
  url
  alt
  createdAt
  updatedAt
}
```

Use for:

- project covers
- project galleries
- case study blocks
- milestones
- playground
- future profile assets

Admin should support upload, preview, selection, alt-text editing, and safe deletion.

Storage should be abstracted so local development can use local storage while production can switch to S3-compatible storage.

---

# 23. SITE SETTINGS

Prefer database-driven settings for values such as:

```text
siteTitle
siteDescription
ownerName
ownerHeadline
ownerBio
contactEmail
githubUrl
linkedinUrl
upworkUrl
defaultTheme
maintenanceMode
seoTitle
seoDescription
socialImage
```

Avoid hardcoding values that should be editable.

---

# 24. TECHNICAL ARCHITECTURE

Recommended stack:

```text
Next.js App Router
React
TypeScript
NestJS
Prisma
PostgreSQL
GSAP / ScrollTrigger
Docker / Docker Compose
```

High-level architecture:

```text
                         INTERNET
                             │
                             ▼
                ┌─────────────────────┐
                │       NEXT.JS       │
                │                     │
                │ Portfolio           │
                │ Admin               │
                │ Private Desk        │
                └──────────┬──────────┘
                           │
                        REST API
                           │
                           ▼
                ┌─────────────────────┐
                │       NESTJS        │
                │                     │
                │ Auth                │
                │ Projects            │
                │ Milestones          │
                │ Media               │
                │ Playground          │
                │ Settings            │
                │ Utilities           │
                └──────────┬──────────┘
                           │
                       PRISMA ORM
                           │
                           ▼
                    ┌────────────┐
                    │ PostgreSQL │
                    └────────────┘

                         +

                S3-compatible Storage
                      [media]
```

---

# 25. DATABASE FOUNDATION

Suggested relationship concept:

```text
User
│
├── Project
│   ├── ProjectMedia
│   └── ProjectBlock
│
├── Milestone
│   └── MilestoneMedia
│
├── PlaygroundItem
│
├── MediaAsset
├── SiteSetting
└── PrivateUtilityData
```

Do not over-engineer version one. Use relational data where natural and JSON only where block flexibility benefits from it.

---

# 26. AUTHENTICATION / AUTHORIZATION

Initially only one owner is required.

Minimal model:

```text
User
────
id
email
passwordHash
role
createdAt
updatedAt
```

Role:

```text
OWNER
```

Flow:

```text
/admin
   ↓
not authenticated
   ↓
/admin/login
   ↓
email + password
   ↓
NestJS Auth
   ↓
authenticated
   ↓
Admin
```

Preferred approach:

- secure HttpOnly cookie
- no sensitive auth token in localStorage
- backend authorization guards
- strong password hashing
- login rate limiting
- CSRF strategy where relevant

Important: hiding `/admin` on the frontend is not security. NestJS must enforce owner-only authorization.

---

# 27. API DIRECTION

Auth:

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Projects:

```text
GET    /api/projects
GET    /api/projects/:slug
POST   /api/admin/projects
PATCH  /api/admin/projects/:id
DELETE /api/admin/projects/:id
PATCH  /api/admin/projects/reorder
```

Milestones:

```text
GET    /api/milestones
POST   /api/admin/milestones
PATCH  /api/admin/milestones/:id
DELETE /api/admin/milestones/:id
```

Playground:

```text
GET    /api/playground
GET    /api/playground/:slug
POST   /api/admin/playground
PATCH  /api/admin/playground/:id
DELETE /api/admin/playground/:id
```

Media:

```text
GET    /api/admin/media
POST   /api/admin/media
PATCH  /api/admin/media/:id
DELETE /api/admin/media/:id
```

Settings:

```text
GET   /api/settings/public
GET   /api/admin/settings
PATCH /api/admin/settings
```

---

# 28. REPOSITORY STRUCTURE

Use a monorepo.

```text
portfolio/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (site)/
│   │   │   ├── admin/
│   │   │   └── desk/
│   │   ├── components/
│   │   ├── animations/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   │
│   └── api/
│       └── src/
│           ├── auth/
│           ├── projects/
│           ├── milestones/
│           ├── playground/
│           ├── media/
│           ├── settings/
│           └── utilities/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   └── config/
│
├── prisma/
│   └── schema.prisma
│
├── docker-compose.yml
└── README.md
```

---

# 29. FRONTEND ARCHITECTURE RULES

- Prefer server-rendered/static-friendly public data where practical.
- Use client components only where needed for GSAP, rich interactions, forms, editors, or client state.
- Do not turn the whole app into a client component.
- Keep animation logic isolated in hooks, animation utilities, and section components.
- Use design tokens instead of hard-coded colors everywhere.

Suggested public components:

```text
SiteHeader
SiteFooter
ThemeToggle
HeroSection
AboutSection
SelectedWorkSection
JourneyPreview
PlaygroundPreview
ContactSection
ProjectCardEditorial
ProjectMetadata
ProjectCaseStudy
CaseStudyBlockRenderer
Stickman
StickmanScene
HandDrawnArrow
DoodleLine
SectionLabel
```

Admin components:

```text
AdminSidebar
AdminHeader
DashboardStats
ProjectForm
ProjectList
MilestoneForm
MilestoneList
MediaPicker
MediaUploader
BlockEditor
BlockToolbar
BlockRenderer
SortableBlockList
SettingsForm
```

---

# 30. RESPONSIVE DESIGN

Support large desktop, laptop, tablet, and mobile.

Do not simply shrink desktop layouts.

Desktop may use large whitespace, asymmetry, pinned sections, horizontal composition, and oversized project imagery.

Mobile should favor:

- vertical flow
- simpler animation
- readable type
- no awkward horizontal story scroll
- appropriate mascot scale
- touch-friendly controls

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 31. ACCESSIBILITY

Mandatory baseline:

- semantic HTML
- keyboard navigation
- visible focus states
- reasonable contrast
- alt text
- form labels
- reduced-motion support
- modal focus management
- no critical information communicated only through animation

Mascot SVGs should be decorative unless they communicate real information.

---

# 32. PERFORMANCE

Goals:

- responsive images
- modern image formats
- lazy load heavy media
- avoid layout shift
- avoid unnecessary client rendering
- animate transform/opacity where possible
- clean up ScrollTrigger instances
- lazy-initialize expensive sections
- optimize fonts

Do not sacrifice usability merely to create a flashy GSAP demo.

---

# 33. SEO

Public pages should support:

- dynamic metadata
- Open Graph
- canonical URL
- sitemap
- robots
- social preview image
- project-specific metadata from CMS

---

# 34. ERROR / EMPTY STATES

Keep the identity consistent.

404 idea:

```text
(・_・?)

this page wandered away.
```

Empty projects:

```text
nothing here yet.
```

Admin errors must remain useful and actionable, not hidden behind playful visuals.

---

# 35. LOCAL DEVELOPMENT FIRST

Deployment is a final phase.

Before deployment the system must run fully locally with:

```text
Next.js
NestJS
PostgreSQL
optional local media storage
```

Docker Compose is recommended for infrastructure.

Suggested ports:

```text
Web        3000
API        4000
Postgres   5432
```

Environment variables:

```env
DATABASE_URL=
JWT_SECRET=
OWNER_EMAIL=
OWNER_PASSWORD=
CORS_ORIGIN=
NEXT_PUBLIC_API_URL=
STORAGE_DRIVER=
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Never commit secrets. Provide `.env.example`.

---

# 36. PHASED IMPLEMENTATION ROADMAP

## PHASE 0 — Foundation

Implement:

- monorepo
- Next.js app
- NestJS app
- PostgreSQL
- Prisma
- shared TS config
- lint/format
- environment setup
- Docker Compose
- seed workflow

Acceptance: local FE + BE + database can start and migrations work.

## PHASE 1 — Core Public UI

Implement:

- design tokens
- light/dark mode
- responsive layout
- navigation
- hero
- about
- selected-work placeholder layout
- journey placeholder
- playground placeholder
- contact
- first mascot SVG poses
- GSAP foundation

Goal: establish visual identity early.

## PHASE 2 — Authentication + Admin Shell

Implement:

- owner user
- login/logout
- protected API
- protected admin routes
- admin sidebar
- dashboard

Acceptance: unauthenticated users cannot access owner-only data and backend guards enforce authorization.

## PHASE 3 — Projects CMS

Implement:

- Project model
- CRUD
- list/form
- draft/published/archived
- featured flag
- sorting
- public API
- homepage populated from DB
- `/work/[slug]`

Acceptance: create/publish a project in Admin and it appears publicly without editing frontend source.

## PHASE 4 — Milestones / Journey CMS

Implement:

- Milestone model
- CRUD
- visibility
- sort order
- journey page
- timeline animation
- mascot movement

Acceptance: creating a milestone updates `/journey`.

## PHASE 5 — Media Library

Implement:

- upload
- asset metadata
- picker
- reusable references
- alt text
- cover images
- galleries

Start with local storage if needed but keep a storage-service abstraction.

## PHASE 6 — Case Study Builder

Implement:

- ProjectBlock model
- block editor
- drag reorder
- preview
- render engine

Initial block set:

```text
Heading
Paragraph
Rich Text
Image
Image Grid
Quote
Callout
Code
Tech Stack
Divider
```

## PHASE 7 — Playground

Implement PlaygroundItem model, admin CRUD, public `/playground`, and optional detail pages.

## PHASE 8 — Private Desk

Implement `/desk`, private dashboard, utility framework, and only a few starter tools.

Good first tools:

```text
JSON formatter
UUID generator
JWT decoder
timestamp converter
```

## PHASE 9 — Animation Polish

Only after functional content/admin flows work.

Refine:

- hero mascot sequence
- scroll-linked mascot travel
- journey line drawing
- project reveals
- doodle path animation
- page transitions where appropriate
- reduced-motion fallback

## PHASE 10 — Content / SEO / Performance

Perform:

- metadata
- sitemap
- Open Graph
- responsive fixes
- accessibility audit
- performance audit
- empty/error states

## PHASE 11 — FINAL DEPLOYMENT

Deployment happens last.

Target idea:

```text
Personal domain
+
self-hosted old/current personal computer
```

Services:

```text
Next.js
NestJS
PostgreSQL
Media Storage
Reverse Proxy
```

Potential production topology:

```text
Internet
   │
   ▼
Cloudflare / DNS
   │
   ▼
Reverse Proxy
   │
   ├── portfolio.example.com -> Next.js
   │
   └── api.example.com       -> NestJS
                                │
                                ▼
                            PostgreSQL
```

Possible tools:

- Docker / Docker Compose
- Caddy or Nginx
- Cloudflare
- HTTPS
- backups

Production checklist:

- restart policy
- DB backup
- media backup
- secrets management
- logs
- health checks
- OS firewall
- secure remote access
- never expose PostgreSQL directly to the public Internet

---

# 37. TESTING STRATEGY

Backend tests:

- login
- auth guards
- Project CRUD
- published filtering
- Milestone CRUD
- validation

Frontend tests:

- homepage renders backend data
- project detail
- theme toggle
- admin login
- create/edit/publish project

Critical E2E scenario:

```text
Login
→ Create Project
→ Publish Project
→ Open Public Portfolio
→ Verify Project Appears
```

---

# 38. SECURITY BASELINE

Before final deployment:

- strong password hashing
- secure cookies
- HTTPS
- restricted CORS
- validation
- safe file-upload limits
- login rate limiting
- no secrets in client bundle
- database port not public
- backups
- dependency audit
- owner-only backend authorization

---

# 39. COPYWRITING STYLE

Tone should be:

- short
- casual
- confident
- slightly playful
- not exaggerated
- not corporate
- not buzzword-heavy

Good:

```text
I design things.
I build things.
```

Good:

```text
things nobody asked me to make.
```

Avoid:

```text
I am a passionate full-stack software engineer dedicated to crafting innovative,
scalable and user-centric digital experiences.
```

Let the work demonstrate ability.

---

# 40. DOODLE SYSTEM

Create reusable SVG details:

- underline
- arrow
- circle
- squiggle
- star
- flower
- hand-drawn divider

Keep them imperfect and sparse.

A custom cursor is optional. If used, make it desktop-only, subtle, touch-safe, accessible, and lightweight.

---

# 41. PROJECT DATA DIRECTION

Recommended core fields:

```text
id
title
slug
shortDescription
description
type
status
year
role
client
coverImageId
githubUrl
liveUrl
behanceUrl
featured
sortOrder
createdAt
updatedAt
publishedAt
```

Related concepts:

```text
ProjectTechnology
ProjectService
ProjectMedia
ProjectBlock
```

Statuses:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Public API should only return public/published data.

---

# 42. DATA FLOW

Homepage projects:

```text
Next.js
   │
   │ GET published featured projects
   ▼
NestJS API
   │
 Prisma
   ▼
PostgreSQL
```

Admin project creation:

```text
/admin/projects/new
        │
        ▼
Project Form
        │
        ▼
POST /api/admin/projects
        │
        ▼
NestJS
        │
        ▼
Prisma
        │
        ▼
PostgreSQL
        │
        ▼
Public portfolio renders it
once status = PUBLISHED
```

Journey:

```text
Admin creates milestone
        │
        ▼
Milestone saved in DB
        │
        ▼
Public API
        │
        ▼
Journey page
        │
        ▼
GSAP maps milestone DOM positions
        │
        ▼
timeline + mascot animation
```

---

# 43. HOMEPAGE WIREFRAME SUMMARY

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   THONG.                              Work  About  ○     │
│                                                         │
│                                                         │
│                 hi, i'm Thông.            \o            │
│                                             |\           │
│       I DESIGN THINGS.                     / \           │
│       I BUILD THINGS.                                    │
│                                                         │
│       designer-ish / fullstack developer                 │
│                                                         │
│                         scroll ↓                         │
└─────────────────────────────────────────────────────────┘

                         ↓

01 / ABOUT

Somewhere between

F I G M A

       and

                         V S  C O D E.

                                  o
                                 /|\
                                 / \

                         ↓

02 / SELECTED WORK

      ┌───────────────────────────────────┐
      │                                   │
      │              VIETBUS              │
      │                                   │
      └───────────────────────────────────┘

      Product / Fullstack Development

                               Explore ↗

                         ↓

      SA SA TOLE

                         ┌────────────────────────────┐
                         │                            │
                         │       BRAND MOCKUPS        │
                         │                            │
                         └────────────────────────────┘

                         Brand Identity / Design

                         ↓

03 / JOURNEY

                       o
                      /|\
                      / \
                       │
                       │
             2023 ─────●
                       │
                       │
             2024 ─────●
                       │
                       │
             2025 ─────●
                       │

                         ↓

04 / PLAYGROUND

things nobody asked me to make.

[ 01 ] weird cursor
[ 02 ] css experiment
[ 03 ] gsap thing
[ 04 ] illustration

                         ↓

05 / SAY HELLO

                      \o/
                       |
                      / \

        have something interesting in mind?

             hello@xxxxxxxx.com

              Github · Upwork · LinkedIn
```

---

# 44. PRODUCT MODEL SUMMARY

Think of the entire project as:

```text
                    YOUR WEBSITE
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
     PORTFOLIO          CMS          MY DESK
       public          private        private
          │              │              │
   Employers /       Manage        Utilities /
    Clients          content         personal
```

The website itself should demonstrate:

- UI/UX
- frontend engineering
- animation
- backend engineering
- database design
- authentication
- CMS architecture
- media management
- responsive design
- deployment
- graphic design

Do not rely on a sentence like “I am passionate about scalable applications.” Let the implementation prove it.

---

# 45. QUALITY / DEFINITION OF DONE

Public portfolio is viable when:

- homepage is polished
- light/dark mode works
- projects come from DB
- case studies work
- milestones come from DB
- journey animation works
- playground exists
- contact works
- mobile is strong
- reduced motion works
- generic portfolio-template look is gone

Admin is viable when the owner can:

- log in/out
- create/edit/delete projects
- draft/publish projects
- reorder projects
- create/edit/delete milestones
- manage media
- edit site settings
- build case studies
- preview changes

without editing source code.

Design quality checks:

```text
Does this look like a generic Next.js portfolio template?
→ If yes, redesign.

Could the mascot be removed without changing the identity?
→ If yes, mascot integration is too weak.

Is the site too cartoonish for a freelance client?
→ If yes, reduce doodle density.

Does every element move?
→ If yes, reduce motion.

Can design work and software projects coexist naturally?
→ If no, improve editorial layouts.

Does the site feel handcrafted?
→ If no, improve typography, spacing, composition, and doodle details.
```

---

# 46. AI CODING AGENT RULES

1. **Do not replace the product intent with generic defaults.** No dark-gradient hero + glass cards just because it is faster.
2. **Database-driven content is mandatory.** If Admin owns a field, public pages must render stored data.
3. **Build incrementally.** End every phase with compiling/runnable code.
4. **Do not deploy early.** Local full-stack stability comes first.
5. **Prefer maintainability over cleverness.** Avoid unnecessary abstractions.
6. **Preserve the art direction.** Every component must fit the pastel, thin-line, editorial, hand-drawn system.
7. **Motion must be intentional.** If an animation only “looks cool,” reconsider it.
8. **Admin UX is practical.** Do not over-animate CRUD screens.
9. **Mobile is first-class.** Every desktop storytelling idea needs a mobile fallback.
10. **Do not fabricate real portfolio content.** Seed data must be clearly demo data and editable.
11. **Do not rewrite working code unnecessarily.** Inspect first, then improve.
12. **Keep documentation updated** as architecture and phases evolve.

Recommended working pattern:

```text
Inspect
→ Plan
→ Implement
→ Run checks
→ Fix
→ Document
→ Commit-ready summary
→ Next phase
```

---

# 47. RECOMMENDED DEMO SEED CONTENT

Project 1:

```text
Title: VietBus
Type: DEVELOPMENT
Year: 2026
Stack:
- Next.js
- NestJS
- PostgreSQL
```

Project 2:

```text
Title: SA SA TOLE
Type: DESIGN
Year: 2026
Services:
- Logo
- Brand identity
- Price list
- Poster
- Thank-you card
```

These examples must still be stored in the database, never hardcoded in homepage components.

---

# 48. FINAL DESIGN PRINCIPLE

The strongest version of this portfolio should make a visitor think:

> **“This feels like this person's own little digital world.”**

Not:

> “This is another developer portfolio template.”

The mascot, editorial layout, pastel system, handcrafted doodles, database-driven content, GSAP storytelling, CMS, and private desk should all reinforce one identity.

---

# 49. AGENT STARTING INSTRUCTION

When an AI coding agent receives this document, it should:

1. Inspect the existing repository.
2. Compare the current implementation against this specification.
3. Produce a gap analysis.
4. Identify what exists, what is partial, what is missing, and what conflicts with this spec.
5. Determine the current phase.
6. Create a concrete checklist for the earliest incomplete phase.
7. Implement one coherent phase at a time.
8. Keep the project runnable after every phase.
9. Do not jump to deployment until the final phase.
10. Never sacrifice the art direction for implementation speed.

Suggested prompt to give the agent together with this file:

```text
Read PORTFOLIO_MASTER_SPEC.md in full before modifying the project.

Treat it as the source of truth for:
- product behavior
- UI art direction
- UX
- data architecture
- routes
- admin behavior
- animation philosophy
- phased implementation

First inspect the current repository and report:
1. what already exists,
2. what partially exists,
3. what is missing,
4. what conflicts with the spec,
5. which implementation phase the repository is currently in.

Then create a concrete task checklist for the current phase.

Do not jump directly to production deployment.
Do not hardcode content that belongs in CMS.
Do not replace the visual identity with a generic template.
Do not overuse GSAP.
Do not break mobile or reduced-motion behavior.

Implement one coherent phase at a time and keep the project runnable after each phase.
```

---

# END OF MASTER SPEC
