# Database Setup: Migrating manikya-backend to Postgres (Supabase) via Prisma

## 1. Context

`manikya-backend` (Express + TypeScript, sibling directory to this repo) currently persists all
data to a flat file, `manikya-backend/data/db.json`, through a hand-rolled `MockDatabase` class in
`src/services/mockDb.ts`. This was step 1 of the plan in `docs/dashboards/implementation_plan.md`
and is fully working, but it is not a real database: no concurrent-write safety, no querying, no
relations, no backup story.

Two existing docs already propose a real schema:

- `docs/dashboards/database_backend_plan.md` — recommends PostgreSQL (Supabase), with a 7-table
  schema (`users`, `business_profiles`, `listings`, `requirements`, `wishlists`, `visits`,
  `analytics_events`) as raw `CREATE TABLE` SQL.
- `docs/dashboards/project_architecture.md` — an earlier wireframe covering `users`, `properties`,
  `requirements`, `jobs`, `job_applications`, `wishlists`.

Neither doc mentions an ORM. `mockDb.ts` currently implements: session (single demo user),
listings, jobs (+ apply), and requirements — it does **not** implement `business_profiles`,
`wishlists`, `visits`, or `analytics_events` yet, even though those are drafted in the plan doc.

This spec covers replacing the file-based mock database with a real Postgres database, hosted on
Supabase, accessed through Prisma.

## 2. Decisions

These were confirmed with the user before writing this spec:

1. **Hosting**: Supabase (managed Postgres, free tier). User does not yet have a project — this
   plan includes the manual steps to create one.
2. **Query layer**: Prisma (schema-as-code, generated TypeScript types, built-in migrations).
3. **Schema scope**: Full schema — all 7 tables from `database_backend_plan.md`, **plus** `jobs`
   and `job_applications` (reconciling with `project_architecture.md` and current `mockDb.ts`
   functionality, since jobs already exist in the running app).
4. **Cutover**: Full replacement. `mockDb.ts` and `data/db.json` are deleted. No dual-write /
   fallback mode.

## 3. Schema Design

Prisma models map to snake_case tables (`@@map`) and columns (`@map`) to match the SQL already
drafted in `database_backend_plan.md`, so the tables match that doc almost verbatim.

### 3.1 `users`
Same as `database_backend_plan.md` section 2.1, with one added column:
- `active_view VARCHAR(20) DEFAULT 'personal'` — carries over `MockSession.activeView`
  (personal/business dashboard toggle), which has no home in the original plan doc's `users`
  table but is required by the current app.

### 3.2 `business_profiles`
As drafted in `database_backend_plan.md` section 2.2. Not yet wired to any route — table exists
for forward compatibility but no controller reads/writes it in this pass.

### 3.3 `listings`
As drafted in `database_backend_plan.md` section 2.3 (`images TEXT[]`, `price NUMERIC(12,2)`,
`details JSONB`). This is a stricter shape than today's `MockProperty` (which has a single `image`
string and a formatted `price` string) — the listing controller adapts on read/write:
- `image` (single string) → `images[0]` on read, wrapped into `[image]` on write
- formatted `price` string → `price` numeric + a `price_label` column for display suffix (`/mo`,
  `total`), matching `project_architecture.md`'s `price_label` field, added to this table.

### 3.4 `requirements`
As drafted in `database_backend_plan.md` section 2.4, but keeping the fields the current
`MockRequirement`/UI actually use that the plan doc dropped: `name`, `budget_label`, `move_in`,
`bhk`, `tags`, `response_count`, `verified` (pulled from `project_architecture.md` section 3.3).
`city` is kept alongside `areas` since the current UI filters by city separately from micro-market.

### 3.5 `wishlists`
As drafted in `database_backend_plan.md` section 2.5 (supports both a `listing_id` and a future
`job_id` reference). Not wired to any route yet — created for schema completeness.

### 3.6 `visits`
As drafted in `database_backend_plan.md` section 2.6. Not wired to any route yet.

### 3.7 `analytics_events`
As drafted in `database_backend_plan.md` section 2.7. Not wired to any route yet.

### 3.8 `jobs` (new — not in database_backend_plan.md)
From `project_architecture.md` section 3.4: `id`, `title`, `company`, `location`, `salary`,
`logo`, `category`.

### 3.9 `job_applications` (new — not in database_backend_plan.md)
From `project_architecture.md` section 3.5: `id`, `user_id` (FK `users`), `job_id` (FK `jobs`),
`applied_at`. Replaces the current `MockJob.applied: boolean` flag — "applied" becomes "a
job_applications row exists for (user, job)" instead of a mutable flag on the job itself (needed
because a boolean-per-job can't represent multiple users applying to the same job, which the
current single-demo-user setup happens to hide).

## 4. Data Access Layer

`src/services/mockDb.ts` is deleted. A new `src/services/db.ts` exports the same function
signatures the controllers already call, backed by a shared Prisma client
(`src/lib/prisma.ts`):

- `getSession()` / `updateSession(patch)` — reads/updates the single seeded demo user by a fixed
  id (`DEMO_USER_ID` constant), since no login flow exists yet. This preserves current app
  behavior exactly.
- `getListings()` / `addListing(listing)` / `deleteListing(id)`
- `getJobs()` / `applyToJob(jobId)` — `applyToJob` now upserts a `job_applications` row for the
  demo user instead of mutating a boolean; `getJobs()` left-joins against `job_applications` for
  the demo user to reconstruct the `applied: boolean` shape the frontend expects, so no frontend
  change is needed.
- `getRequirements()` / `addRequirement(req)` / `updateRequirement(req)` / `deleteRequirement(id)`

Controllers (`authController.ts`, `listingController.ts`, `jobController.ts`,
`requirementsController.ts`) change their import from `../services/mockDb` to
`../services/db` — call sites are otherwise unchanged since signatures match.

## 5. Migration & Environment

1. **Supabase project**: user creates a free project at supabase.com, retrieves the pooled
   connection string (Transaction pooler, for `DATABASE_URL`) and direct connection string (for
   `DIRECT_URL`, used by Prisma Migrate) from Project Settings → Database.
2. **`.env`** in `manikya-backend/` (gitignored): `DATABASE_URL`, `DIRECT_URL`.
3. **Install**: `prisma`, `@prisma/client` added to `manikya-backend/package.json`.
4. **`prisma/schema.prisma`**: all 9 models above, `datasource db` using `DATABASE_URL` +
   `directUrl = env("DIRECT_URL")`.
5. **Run** `npx prisma migrate dev --name init` — creates all tables in Supabase and generates the
   Prisma client.
6. **`prisma/seed.ts`**: inserts the demo user (Ravi Sharma, matching current seed data) and the 3
   existing seed jobs (Innovate Tech / Nexus Logistics / Aether AI, matching current
   `mockDb.ts` seed data) so behavior is identical to today after cutover. Wired via
   `"prisma": { "seed": "ts-node prisma/seed.ts" }` in `package.json`, run with
   `npx prisma db seed`.
7. **Delete** `manikya-backend/src/services/mockDb.ts` and `manikya-backend/data/` (including
   `db.json`).
8. **`.gitignore`** in `manikya-backend/`: add `.env` (currently no `.gitignore` exists there —
   one will be created).

## 6. Verification Plan

Manual (no automated test suite exists in `manikya-backend` today, so this stays manual, matching
the existing verification style in `implementation_plan.md`):

1. `npx prisma migrate dev` completes without error; tables visible in Supabase's Table Editor.
2. `npx prisma db seed` completes; demo user + 3 jobs visible in Supabase.
3. `npm run dev` starts the backend cleanly (no more `fs`/`db.json` references).
4. `curl` each endpoint:
   - `GET /api/auth/session` → returns seeded Ravi Sharma user
   - `POST /api/listings`, `GET /api/listings`, `DELETE /api/listings/:id` → row appears/disappears
     in Supabase
   - `GET /api/jobs`, `POST /api/jobs/apply` → `applied` flips true for that job, a
     `job_applications` row appears in Supabase
   - `POST /api/requirements`, `PUT /api/requirements/:id`, `DELETE /api/requirements/:id` → rows
     change in Supabase
5. Restart the backend process and re-run `GET` endpoints — data must still be there (proves it's
   really Postgres, not an in-memory cache).
6. Confirm the Next.js frontend (`npm run dev` in `manikya-nest-next`) still works end-to-end
   against the migrated backend: log in to profile, post a listing, post a requirement, apply to a
   job.

## 7. Out of Scope

- Real authentication (signup/login/OTP, password hashing, sessions/JWT) — the demo-user session
  model is preserved as-is.
- Wiring `business_profiles`, `wishlists`, `visits`, `analytics_events` into any controller or
  frontend page — tables are created per the full-schema decision, but no CRUD is built for them
  yet.
- Deploying the backend anywhere — this is local dev against a cloud Postgres instance.
