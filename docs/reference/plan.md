# Portfolio Fullstack Roadmap — `plan.md`

> Mục tiêu: xây dựng một portfolio cá nhân có **Frontend + Backend + Database + Admin CMS + Private Desk**, chạy hoàn chỉnh ở **local trước**, sau đó mới chuyển sang testing/hardening và cuối cùng mới triển khai **FE + BE + PostgreSQL + Media** lên home server.

---

## 0. Nguyên tắc chung

### Tech stack chính

- **Frontend:** Next.js (App Router) + React + TypeScript
- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Animation:** GSAP + ScrollTrigger
- **Styling:** CSS Modules / Tailwind / custom design system tùy implementation cuối
- **Auth:** Owner-only authentication cho Admin/Desk
- **Local DB:** Docker Compose chỉ chạy PostgreSQL
- **Production:** để sau khi `LOCAL COMPLETE`

### Kiến trúc local

```text
Browser
   │
   ├── http://localhost:3000  → Next.js
   │
   └── http://localhost:4000  → NestJS
                                  │
                                  ▼
                             PostgreSQL
                             localhost:5432
```

### Nguyên tắc phát triển

- Không hardcode project/milestone vào homepage.
- Public portfolio phải render dữ liệu từ Backend/Database.
- Admin CMS phải đủ dùng để quản lý toàn bộ nội dung chính.
- Animation chỉ làm mạnh sau khi layout/content đã ổn định.
- Production/deployment **không chen vào giai đoạn local**.
- `Phase 8 — LOCAL COMPLETE` là milestone trước mắt.

---

# PHASE 0 — FOUNDATION & PROJECT SETUP

## Mục tiêu

Tạo foundation sạch, dễ mở rộng và dễ chạy local.

## Scope

```text
portfolio/
├── apps/
│   ├── web/          # Next.js
│   └── api/          # NestJS
├── packages/
│   ├── types/
│   ├── validation/
│   └── config/
├── docker-compose.local.yml
├── pnpm-workspace.yaml
└── plan.md
```

## Checklist

- [ ] Chuẩn hóa monorepo.
- [ ] Setup TypeScript strict mode.
- [ ] Setup ESLint + Prettier.
- [ ] Setup shared types package.
- [ ] Setup shared validation schema nếu cần.
- [ ] Setup `.env.example` cho Web/API.
- [ ] Setup PostgreSQL bằng Docker Compose local.
- [ ] Setup Prisma.
- [ ] Setup base migration.
- [ ] Setup seed script.
- [ ] Setup root scripts:
  - [ ] `pnpm dev`
  - [ ] `pnpm lint`
  - [ ] `pnpm typecheck`
  - [ ] `pnpm db:migrate`
  - [ ] `pnpm db:seed`

## Local commands dự kiến

```bash
docker compose -f docker-compose.local.yml up -d postgres
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Exit criteria

- Next.js chạy tại `localhost:3000`.
- NestJS chạy tại `localhost:4000`.
- PostgreSQL chạy local và Prisma connect được.
- Có seed data tối thiểu.
- Toàn repo lint/typecheck pass.

---

# PHASE 1 — DESIGN SYSTEM & PORTFOLIO SHELL

## Mục tiêu

Xây visual identity hoàn chỉnh trước khi đổ nhiều content/business logic.

## Design direction

- Pastel / blush pink / cream.
- Minimal editorial layout.
- Thin typography.
- Hand-drawn doodle accent.
- Stickman mascot riêng.
- Cute nhưng không childish.
- Light Mode + Dark Mode.

## Scope

### Design tokens

- [ ] Color palette Light Mode.
- [ ] Color palette Dark Mode.
- [ ] Typography scale.
- [ ] Spacing scale.
- [ ] Border/radius system.
- [ ] Shadow system.
- [ ] Motion tokens.
- [ ] Breakpoints.

### Core components

- [ ] Button.
- [ ] Text Link.
- [ ] Badge/Tag.
- [ ] Section Header.
- [ ] Container.
- [ ] Image frame.
- [ ] Theme Toggle.
- [ ] Header/Nav.
- [ ] Footer.
- [ ] Doodle decoration.
- [ ] Stickman SVG component.

### Responsive foundation

- [ ] Desktop.
- [ ] Tablet.
- [ ] Mobile.

## Exit criteria

- Có `/design-system` hoặc Storybook-like dev page nội bộ nếu cần.
- Header/Footer/Theme hoạt động.
- Light/Dark mode giữ đúng identity.
- Không có layout break ở mobile cơ bản.

---

# PHASE 2 — PUBLIC PORTFOLIO PAGES

## Mục tiêu

Hoàn thiện toàn bộ bề mặt public mà client/recruiter nhìn thấy.

## Routes

```text
/
/work
/work/[slug]
/journey
/playground
/about
```

## Homepage

### Sections

- [ ] Hero.
- [ ] About preview.
- [ ] Selected Work.
- [ ] Journey preview.
- [ ] Playground preview.
- [ ] Contact.

### Hero concept

```text
hello, i'm Thông.

I DESIGN THINGS.
I BUILD THINGS.

Designer-ish / Fullstack Developer
```

- [ ] Stickman mascot ở hero.
- [ ] CTA xem work.
- [ ] CTA contact/social.

## Work page

- [ ] List project theo editorial layout.
- [ ] Filter: Development / Design / Hybrid.
- [ ] Featured project treatment.
- [ ] Project card không dùng kiểu generic dashboard card.

## Project detail

- [ ] Cover.
- [ ] Title.
- [ ] Summary.
- [ ] Role.
- [ ] Client.
- [ ] Year.
- [ ] Services.
- [ ] Technologies.
- [ ] Case study content placeholder.
- [ ] Links: Live/GitHub/Behance.

## Journey page

- [ ] Timeline layout.
- [ ] Year grouping.
- [ ] Milestone card/entry.
- [ ] Placeholder cho timeline GSAP phase sau.

## Playground page

- [ ] Lab/experiment list.
- [ ] Development experiment.
- [ ] Design experiment.
- [ ] Miscellaneous creative work.

## About page

- [ ] Short personal introduction.
- [ ] Design + Development positioning.
- [ ] Toolset/skills không dùng progress bar.
- [ ] Contact/social.

## Data strategy giai đoạn này

Có thể dùng seed data/mock API tạm nhưng component phải nhận dữ liệu qua interface/API layer.

## Exit criteria

- Toàn bộ route public tồn tại.
- Responsive cơ bản hoàn chỉnh.
- Không có content quan trọng nằm hardcode trực tiếp trong component UI.
- Project detail có thể render từ object/API data.

---

# PHASE 3 — BACKEND CORE + DATABASE

## Mục tiêu

Biến portfolio thành application thật với dữ liệu quản lý được.

## NestJS Modules

```text
src/
├── auth/
├── users/
├── projects/
├── milestones/
├── media/
├── playground/
├── settings/
└── common/
```

## Prisma models

### User

- [ ] id
- [ ] email
- [ ] passwordHash
- [ ] role
- [ ] createdAt
- [ ] updatedAt

### Project

- [ ] id
- [ ] title
- [ ] slug
- [ ] shortDescription
- [ ] description
- [ ] projectType
- [ ] status
- [ ] year
- [ ] role
- [ ] client
- [ ] coverImage
- [ ] githubUrl
- [ ] liveUrl
- [ ] behanceUrl
- [ ] featured
- [ ] sortOrder
- [ ] createdAt
- [ ] updatedAt

### ProjectBlock

- [ ] id
- [ ] projectId
- [ ] type
- [ ] content JSON
- [ ] sortOrder

### ProjectMedia

- [ ] id
- [ ] projectId
- [ ] mediaId
- [ ] sortOrder

### Milestone

- [ ] id
- [ ] title
- [ ] description
- [ ] date
- [ ] type
- [ ] visible
- [ ] sortOrder

### MediaAsset

- [ ] id
- [ ] fileName
- [ ] originalName
- [ ] mimeType
- [ ] path/url
- [ ] size
- [ ] width/height nếu là image
- [ ] createdAt

### PlaygroundItem

- [ ] id
- [ ] title
- [ ] slug
- [ ] description
- [ ] type
- [ ] thumbnail
- [ ] liveUrl
- [ ] sourceUrl
- [ ] visible
- [ ] sortOrder

### SiteSetting

- [ ] id/key
- [ ] value JSON

## Public APIs

```text
GET /api/projects
GET /api/projects/:slug
GET /api/milestones
GET /api/playground
GET /api/settings/public
```

## Admin APIs

```text
POST   /api/admin/projects
PATCH  /api/admin/projects/:id
DELETE /api/admin/projects/:id

POST   /api/admin/milestones
PATCH  /api/admin/milestones/:id
DELETE /api/admin/milestones/:id

POST   /api/admin/playground
PATCH  /api/admin/playground/:id
DELETE /api/admin/playground/:id
```

## Validation/error handling

- [ ] DTO validation.
- [ ] Consistent API response format.
- [ ] Global exception filter.
- [ ] NotFound handling.
- [ ] Slug uniqueness.
- [ ] Pagination support nếu cần.

## Exit criteria

- Public site lấy project/milestone thật từ PostgreSQL.
- Seed chạy được từ đầu.
- CRUD API test thủ công pass.
- Không còn dependency vào mock data cho core content.

---

# PHASE 4 — AUTHENTICATION + ADMIN CMS

## Mục tiêu

Tạo CMS thật để quản lý portfolio mà không sửa source.

## Auth

- [ ] Owner account.
- [ ] Login bằng email/password.
- [ ] Password hash.
- [ ] JWT/session strategy.
- [ ] HttpOnly cookie.
- [ ] Logout.
- [ ] Owner role guard.
- [ ] Backend authorization bắt buộc.

## Routes

```text
/admin/login
/admin
/admin/projects
/admin/projects/new
/admin/projects/[id]
/admin/milestones
/admin/playground
/admin/media
/admin/settings
```

## Admin Dashboard

- [ ] Project count.
- [ ] Published count.
- [ ] Draft count.
- [ ] Milestone count.
- [ ] Recent edits.
- [ ] Quick create actions.

## Project CMS

- [ ] List.
- [ ] Search.
- [ ] Filter status/type.
- [ ] Create.
- [ ] Edit.
- [ ] Delete confirmation.
- [ ] Draft/Published/Archived.
- [ ] Featured toggle.
- [ ] Sort order.

### Project form

- [ ] Title.
- [ ] Slug.
- [ ] Short description.
- [ ] Long description.
- [ ] Type.
- [ ] Status.
- [ ] Year.
- [ ] Role.
- [ ] Client.
- [ ] Technologies.
- [ ] Services.
- [ ] Cover image.
- [ ] GitHub URL.
- [ ] Live URL.
- [ ] Behance URL.

## Milestone CMS

- [ ] List.
- [ ] Create.
- [ ] Edit.
- [ ] Delete.
- [ ] Visibility toggle.
- [ ] Reorder.

## Playground CMS

- [ ] List.
- [ ] Create.
- [ ] Edit.
- [ ] Delete.
- [ ] Visibility.
- [ ] Reorder.

## Settings CMS

- [ ] Profile/about.
- [ ] Social links.
- [ ] Contact email.
- [ ] Site metadata.
- [ ] Hero copy.
- [ ] Availability/freelance status nếu cần.

## Exit criteria

Admin có thể tạo project mới và project xuất hiện ngoài public site mà không sửa code.

```text
Admin
  │
  │ Create Project
  ▼
NestJS
  │
  ▼
PostgreSQL
  │
  ▼
Public Portfolio
```

---

# PHASE 5 — CASE STUDY BUILDER + MEDIA MANAGER

## Mục tiêu

Cho phép xây project detail/case study ngay trong Admin.

## Case Study Block Types

- [ ] Heading.
- [ ] Paragraph.
- [ ] Full-width image.
- [ ] Two-column images.
- [ ] Image + text.
- [ ] Quote.
- [ ] Video/embed.
- [ ] Code block.
- [ ] Architecture/diagram image.
- [ ] Spacer/divider.

## Builder features

- [ ] Add block.
- [ ] Edit block.
- [ ] Delete block.
- [ ] Duplicate block.
- [ ] Drag/reorder.
- [ ] Preview.
- [ ] Save draft.
- [ ] Publish.

## Media Manager

### Local storage

```text
local-data/
└── uploads/
    ├── projects/
    ├── milestones/
    └── playground/
```

### Features

- [ ] Upload image.
- [ ] Delete image.
- [ ] Browse library.
- [ ] Select existing media.
- [ ] Alt text.
- [ ] File size validation.
- [ ] Mime validation.
- [ ] Image dimension extraction.
- [ ] Optional image optimization.

## Exit criteria

- Case study được tạo hoàn toàn trong Admin.
- `/work/[slug]` render dynamic blocks từ DB.
- Upload media local hoạt động ổn định.

---

# PHASE 6 — GSAP + CHARACTER STORYTELLING

## Mục tiêu

Thêm signature motion sau khi UI/content đã ổn định.

## Motion principles

- Không animate mọi thứ.
- Animation phải có purpose.
- Mascot là đối tượng chuyển động chính.
- UI còn lại tinh tế, editorial.

## Tier 1 — Micro motion

- [ ] Button hover.
- [ ] Link underline.
- [ ] Theme transition.
- [ ] Image hover.
- [ ] Small cursor/detail animation nếu phù hợp.

## Tier 2 — Section motion

- [ ] Text reveal.
- [ ] Image reveal.
- [ ] Subtle parallax.
- [ ] Stagger.
- [ ] SVG line drawing.

## Tier 3 — Storytelling

### Hero

- [ ] Stickman intro.
- [ ] Wave animation.
- [ ] Hero text entrance.

### Work

- [ ] Project transition.
- [ ] Optional desktop pinned/horizontal sequence nếu UX tốt.

### Journey

- [ ] Timeline line draw theo scroll.
- [ ] Stickman di chuyển theo journey.
- [ ] Milestone reveal.

### Contact

- [ ] Ending pose/animation.

## Accessibility/performance

- [ ] `prefers-reduced-motion`.
- [ ] Mobile animation fallback.
- [ ] Cleanup GSAP contexts.
- [ ] Lazy load heavy animation.
- [ ] Avoid layout thrashing.
- [ ] Test 60fps ở máy trung bình.

## Exit criteria

- Animation không làm giảm usability.
- Mobile không bị giật/layout lỗi.
- Reduced motion hoạt động.
- Mascot tạo được cảm giác xuyên suốt website.

---

# PHASE 7 — PRIVATE DESK / PERSONAL UTILITIES

## Mục tiêu

Biến portfolio thành website cá nhân thực sự dùng hằng ngày.

## Route

```text
/desk
```

## Authentication

- Chỉ Owner truy cập.
- Reuse auth system từ Admin.

## Dashboard ideas

- [ ] Greeting/time/date.
- [ ] Project stats.
- [ ] Notes count.
- [ ] Shortcut utilities.

## Utility candidates

- [ ] JSON Formatter.
- [ ] JWT Decoder.
- [ ] UUID Generator.
- [ ] Timestamp Converter.
- [ ] Color Converter.
- [ ] Regex Tester.
- [ ] URL Encoder/Decoder.
- [ ] Base64 Encoder/Decoder.
- [ ] Snippet Manager.
- [ ] Bookmark Manager.
- [ ] Personal Notes.

## Scope rule

Desk là extension. Không để Desk trì hoãn việc đạt `LOCAL COMPLETE` nếu core portfolio/CMS chưa xong.

## Exit criteria

- `/desk` authenticated.
- Có tối thiểu vài utility hữu ích.
- Không ảnh hưởng public site.

---

# PHASE 8 — LOCAL COMPLETE ⭐

## Mục tiêu

Đây là milestone lớn đầu tiên và là **đích trước mắt**.

## Public site

```text
http://localhost:3000
```

Phải có:

- [ ] Homepage hoàn chỉnh.
- [ ] Work listing.
- [ ] Project case study.
- [ ] Journey.
- [ ] Playground.
- [ ] About.
- [ ] Contact.
- [ ] Responsive desktop/tablet/mobile.
- [ ] Light/Dark Mode.
- [ ] GSAP storytelling.
- [ ] Reduced motion.

## Admin

```text
http://localhost:3000/admin
```

Phải có:

- [ ] Login/logout.
- [ ] Dashboard.
- [ ] Project CMS.
- [ ] Milestone CMS.
- [ ] Playground CMS.
- [ ] Media Manager.
- [ ] Case Study Builder.
- [ ] Site Settings.

## Private Desk

```text
http://localhost:3000/desk
```

- [ ] Owner-only.
- [ ] Utility foundation.

## Backend

```text
http://localhost:4000
```

- [ ] NestJS APIs ổn định.
- [ ] Auth/authorization.
- [ ] Validation.
- [ ] Error handling.
- [ ] CRUD complete.

## Database

```text
localhost:5432
```

- [ ] PostgreSQL local.
- [ ] Prisma migrations sạch.
- [ ] Seed hoạt động.
- [ ] Relations ổn định.

## Critical end-to-end test

```text
Admin
  │
  ├── Create project
  ├── Upload media
  ├── Build case study
  └── Publish
          │
          ▼
       NestJS
          │
          ▼
     PostgreSQL
          │
          ▼
   Public Portfolio
          │
          ▼
 Project xuất hiện đúng
```

## Definition of LOCAL COMPLETE

- Không cần sửa source để thêm/sửa/xóa content chính.
- Không phụ thuộc mock data.
- Không có lỗi nghiêm trọng trên desktop/mobile.
- Animation usable.
- Admin đủ dùng thật.
- Data tồn tại qua restart local.
- Có thể clone repo trên máy khác và setup bằng README.

---

# ===== STOP POINT: LOCAL DEVELOPMENT =====

> Tạm thời project sẽ phát triển tới đây trước.
>
> **Không cần mua domain / setup server / Nginx / Cloudflare / production Docker trước khi Phase 8 hoàn thành.**

---

# PHASE 9 — TESTING & HARDENING

## Mục tiêu

Ổn định app trước production.

## Testing

- [ ] Unit tests cho service quan trọng.
- [ ] API integration tests.
- [ ] Auth tests.
- [ ] E2E tests cho critical flow.
- [ ] Admin CRUD tests.
- [ ] Responsive manual test.
- [ ] Browser compatibility.

## Security

- [ ] Rate limiting.
- [ ] Security headers.
- [ ] Input sanitization.
- [ ] Upload security.
- [ ] Auth cookie review.
- [ ] Authorization review.
- [ ] No secrets committed.

## Performance

- [ ] Lighthouse review.
- [ ] Image optimization.
- [ ] Bundle analysis.
- [ ] GSAP performance.
- [ ] DB query review.

## Exit criteria

- Critical tests pass.
- Không có known blocker/security issue nghiêm trọng.

---

# PHASE 10 — PRODUCTION PREPARATION

## Mục tiêu

Chuẩn hóa source để deploy được mà chưa cần đưa lên Internet.

## Tasks

- [ ] Production Dockerfile cho Next.js.
- [ ] Production Dockerfile cho NestJS.
- [ ] Production Docker Compose.
- [ ] Nginx config.
- [ ] Persistent PostgreSQL volume.
- [ ] Persistent media volume.
- [ ] Health checks.
- [ ] `.env.production.example`.
- [ ] Prisma production migration flow.
- [ ] `deploy.sh`.
- [ ] `backup.sh`.
- [ ] `restore.sh`.
- [ ] `rollback.sh`.

## Production topology

```text
Nginx
├── Next.js
└── NestJS
      └── PostgreSQL
```

## Exit criteria

- Production stack chạy được trên local/test machine bằng Docker.

---

# PHASE 11 — HOME SERVER SETUP

## Mục tiêu

Chuẩn bị máy cũ/máy riêng làm home server 24/7.

## Tasks

- [ ] Chọn máy server.
- [ ] Backup dữ liệu cũ trên máy đó.
- [ ] Cài Linux Server LTS.
- [ ] Tạo non-root user.
- [ ] SSH key.
- [ ] Firewall.
- [ ] Docker Engine.
- [ ] Docker Compose.
- [ ] Disable sleep/hibernate.
- [ ] BIOS auto power-on after power loss.
- [ ] Static LAN IP/DHCP reservation.
- [ ] Tạo `/srv/portfolio`.
- [ ] Clone private repository.

## Exit criteria

- Có thể SSH vào server trong LAN.
- Docker chạy sau reboot.
- Production stack chạy ổn trong LAN.

---

# PHASE 12 — DOMAIN + CLOUDFLARE

## Mục tiêu

Kết nối tên miền với home server an toàn.

## Tasks

- [ ] Mua domain.
- [ ] Add domain vào Cloudflare.
- [ ] Đổi nameserver.
- [ ] DNS verification.
- [ ] DNSSEC.
- [ ] Setup Cloudflare Tunnel.
- [ ] Route domain → local Nginx.
- [ ] Redirect `www` → apex domain hoặc ngược lại.
- [ ] HTTPS test.

## Desired routing

```text
https://domain.com          → Next.js
https://domain.com/work     → Next.js
https://domain.com/admin    → Next.js Admin
https://domain.com/desk     → Next.js Desk
https://domain.com/api/*    → NestJS
```

## Exit criteria

- Domain resolve đúng.
- HTTPS hoạt động.
- Không expose port DB/API/Web trực tiếp ra Internet.

---

# PHASE 13 — FINAL DEPLOY: FE + BE + DB + MEDIA

## Mục tiêu

Đưa toàn bộ hệ thống production lên home server.

## Deploy components

- [ ] Next.js FE.
- [ ] NestJS BE.
- [ ] PostgreSQL DB.
- [ ] Media storage.
- [ ] Nginx.
- [ ] Tunnel connector.

## Deployment flow

```text
git pull
   ↓
backup current data
   ↓
build production images
   ↓
run Prisma migrate deploy
   ↓
docker compose up -d
   ↓
healthcheck
   ↓
smoke test
```

## Smoke tests

- [ ] Homepage.
- [ ] Work pages.
- [ ] API public.
- [ ] Admin login.
- [ ] Create/update project.
- [ ] Media upload.
- [ ] Publish project.
- [ ] Desk auth.

## Exit criteria

- FE + BE + DB + Media cùng chạy trên home server.
- Website truy cập được bằng domain thật.

---

# PHASE 14 — BACKUP + MONITORING + RECOVERY

## Mục tiêu

Đảm bảo self-host không trở thành single point of failure không kiểm soát.

## Backup

- [ ] Daily PostgreSQL dump.
- [ ] Media backup.
- [ ] Backup sang ổ ngoài.
- [ ] Backup rotation.
- [ ] Restore documentation.
- [ ] Test restore định kỳ.

## Suggested retention

```text
Daily   : 7
Weekly  : 4
Monthly : 6
```

## Monitoring

- [ ] Container health.
- [ ] Disk usage.
- [ ] Database health.
- [ ] Server uptime.
- [ ] Application logs.
- [ ] Tunnel connectivity.

## Recovery scenarios

- [ ] Container crash.
- [ ] Server reboot.
- [ ] Power outage.
- [ ] Internet outage.
- [ ] Bad migration.
- [ ] Database corruption/loss.
- [ ] Media loss.

## Exit criteria

- Có backup ngoài server.
- Đã restore thử thành công ít nhất một lần.

---

# PHASE 15 — CI/CD & OPERATIONS

## Mục tiêu

Tự động hóa deployment sau khi production đã ổn định.

## Pipeline

```text
Local Development
      │
      ▼
   git push
      │
      ▼
    GitHub
      │
      ▼
 Tests / Build
      │
      ▼
Home Server Deploy
      │
      ├── Backup
      ├── Migration
      ├── Deploy
      └── Healthcheck
```

## Tasks

- [ ] CI lint.
- [ ] CI typecheck.
- [ ] CI tests.
- [ ] Build verification.
- [ ] Controlled deployment.
- [ ] Migration step.
- [ ] Health check.
- [ ] Rollback strategy.
- [ ] Deployment logs.

## Exit criteria

- Push/release có thể deploy theo quy trình nhất quán.
- Failed deploy không làm mất dữ liệu.

---

# PRIORITY ROADMAP

## Hiện tại

```text
PHASE 0
   ↓
PHASE 1
   ↓
PHASE 2
   ↓
PHASE 3
   ↓
PHASE 4
   ↓
PHASE 5
   ↓
PHASE 6
   ↓
PHASE 7
   ↓
PHASE 8 — LOCAL COMPLETE ⭐
```

### Tạm dừng ở đây.

Chỉ khi `LOCAL COMPLETE` đạt yêu cầu mới đi tiếp:

```text
PHASE 9  Testing & Hardening
   ↓
PHASE 10 Production Preparation
   ↓
PHASE 11 Home Server Setup
   ↓
PHASE 12 Domain + Cloudflare
   ↓
PHASE 13 FINAL DEPLOY FE + BE + DB + MEDIA
   ↓
PHASE 14 Backup + Monitoring
   ↓
PHASE 15 CI/CD
```

---

# DEVELOPMENT WORKFLOW TRƯỚC MẮT

```bash
# 1. Start PostgreSQL
docker compose -f docker-compose.local.yml up -d postgres

# 2. Start FE + BE
pnpm dev
```

Sau đó:

```text
Portfolio : http://localhost:3000
Admin     : http://localhost:3000/admin
Desk      : http://localhost:3000/desk
API       : http://localhost:4000
Postgres  : localhost:5432
```

Không cần ở local:

- Nginx
- SSL
- Cloudflare
- Domain
- Ubuntu Server
- Production Docker
- CI/CD deploy

---

# DEFINITION OF DONE — TOÀN PROJECT

Project chỉ được coi là hoàn chỉnh khi:

- [ ] Portfolio có visual identity riêng.
- [ ] Project/Milestone/Playground không hardcode.
- [ ] Admin quản lý được content chính.
- [ ] Case Study Builder dùng được thật.
- [ ] Media upload được quản lý.
- [ ] Owner-only Desk hoạt động.
- [ ] Light/Dark mode hoàn chỉnh.
- [ ] GSAP storytelling mượt và có reduced-motion fallback.
- [ ] Responsive tốt.
- [ ] Backend có auth/validation/error handling.
- [ ] PostgreSQL migrations/backup/restore rõ ràng.
- [ ] FE + BE + DB + Media được self-host trên home server.
- [ ] Domain + HTTPS hoạt động.
- [ ] Không expose PostgreSQL trực tiếp ra Internet.
- [ ] Có backup ngoài server.
- [ ] Có deployment/rollback procedure.

---

## Current Milestone

> **TARGET HIỆN TẠI: PHASE 8 — LOCAL COMPLETE**

Production/server/domain sẽ chỉ bắt đầu sau khi milestone này hoàn thành.
