# Database Setup (Postgres/Supabase + Prisma) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `manikya-backend`'s file-based `mockDb.ts`/`data/db.json` with a real Postgres database hosted on Supabase, accessed through Prisma, without changing any HTTP contract the frontend relies on.

**Architecture:** `manikya-backend` (Express + TypeScript, lives in the sibling directory `..\manikya-backend` relative to this repo) gets a Prisma schema, a Prisma client singleton, and a new `src/services/db.ts` module that exposes the same function names `mockDb.ts` exposed today. Controllers swap their import and become `async`. `mockDb.ts` and `data/` are deleted once everything is migrated.

**Tech Stack:** Prisma ORM, `@prisma/client`, PostgreSQL (Supabase), Express, TypeScript, ts-node (already installed).

## Global Constraints

- All work in this plan happens in `manikya-backend`, **not** `manikya-nest-next` (this repo). Full path: `C:\Users\mahad\OneDrive\Desktop\new manikya_app\manikya-backend`.
- `manikya-backend` has no `.git` repository yet — Task 1 initializes one. Every subsequent task's "commit" step commits into that new repo.
- The demo user's id must remain the literal string `demo-9000000001` — the frontend (`src/app/profile/page.tsx:138`, `src/components/profile/BusinessDashboard.tsx:97` in `manikya-nest-next`) checks `session.id.startsWith("demo-")` to decide whether to show demo sample data. Breaking this string format breaks that check.
- No real login/signup flow is being built. `getSession()`/`updateSession()` always operate on the single seeded demo user — this matches current behavior exactly (see `docs/superpowers/specs/2026-07-06-database-setup-design.md` section 7, "Out of Scope").
- Schema uses plain `String @id @default(cuid())` primary keys (not Postgres native `uuid` + `gen_random_uuid()` as literally written in `docs/dashboards/database_backend_plan.md`). This avoids depending on a Postgres extension being enabled on Supabase and matches every existing TypeScript interface in `mockDb.ts`, which already types all ids as plain `string` (`Requirement.id` and `JobApplication.id` are the two exceptions and stay `Int @id @default(autoincrement())`, matching `MockRequirement.id: number` and the "BIGINT/SERIAL" type called for in `docs/dashboards/project_architecture.md`).
- `Listing.price` stays a plain `String` column (not `Decimal` as drafted in the plan doc). Nothing in the codebase parses or computes on listing price today — grep confirms no frontend page calls the `/api/listings` endpoints at all yet (they exist in the backend but aren't wired to any UI), so there is no real payload format to convert against. Forcing a numeric parse now would be inventing a currency-parsing scheme nothing requires. `priceLabel`, `locality`, `world`, `details` are added as nullable/defaulted extra columns for schema completeness (per the "full schema" scope decision) but are not populated by any controller today.
- `Requirement.postedAt` stays a plain `String` column (not `TIMESTAMP` as drafted in the plan doc), because the frontend sends and displays it as a literal relative string (`"Just now"`, `"2h ago"` — see `manikya-nest-next/src/app/requirements/page.tsx:176` and `manikya-nest-next/src/components/RequirementCard.tsx:41`), never a real timestamp.
- Only the session (`/api/auth/*`) and requirements (`/api/requirements`) endpoints are actually called by the running frontend today (confirmed via grep — only `demoAuth.ts` and `requirements.ts` import `apiClient`). Listings and jobs endpoints exist and must keep working, but are verified via `curl` only, not a frontend click-through, since no frontend page calls them yet.

---

### Task 1: Git init, Supabase project, and Prisma installation

**Files:**
- Create: `manikya-backend/.gitignore`
- Create: `manikya-backend/.env` (gitignored, never committed)
- Modify: `manikya-backend/package.json` (add `prisma`, `@prisma/client`)
- Create: `manikya-backend/prisma/schema.prisma` (scaffold only — full models added in Task 2)

**Interfaces:**
- Produces: a working `DATABASE_URL` and `DIRECT_URL` in `.env` that Task 2's `prisma migrate dev` will connect with.

- [ ] **Step 1: Initialize git in the backend**

```bash
cd "C:\Users\mahad\OneDrive\Desktop\new manikya_app\manikya-backend"
git init
```

Expected: `Initialized empty Git repository in ...manikya-backend/.git/`

- [ ] **Step 2: Create `.gitignore`**

Create `manikya-backend/.gitignore`:

```
node_modules
dist
.env
```

- [ ] **Step 3: Create a Supabase project (manual, in your browser)**

1. Go to https://supabase.com, sign in (or create an account).
2. Click "New Project". Choose an organization, name it e.g. `manikya`, set a database password (save it somewhere — you'll need it below), pick the region closest to you.
3. Wait ~2 minutes for provisioning to finish.
4. Once ready, go to **Project Settings → Database**.
5. Under **Connection string**, switch the dropdown to **Transaction pooler** and copy the URI — this is your `DATABASE_URL`. It looks like:
   `postgresql://postgres.xxxxxxxx:[YOUR-PASSWORD]@aws-0-xx-xxxx-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
6. Switch the dropdown to **Direct connection** and copy that URI — this is your `DIRECT_URL`. It looks like:
   `postgresql://postgres.xxxxxxxx:[YOUR-PASSWORD]@aws-0-xx-xxxx-1.pooler.supabase.com:5432/postgres`
7. Replace `[YOUR-PASSWORD]` in both with the database password from step 2.

- [ ] **Step 4: Create `.env`**

Create `manikya-backend/.env` (paste your own values from Step 3):

```
DATABASE_URL="postgresql://postgres.xxxxxxxx:YOUR-PASSWORD@aws-0-xx-xxxx-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxxxxx:YOUR-PASSWORD@aws-0-xx-xxxx-1.pooler.supabase.com:5432/postgres"
```

- [ ] **Step 5: Install Prisma**

```bash
cd "C:\Users\mahad\OneDrive\Desktop\new manikya_app\manikya-backend"
npm install @prisma/client
npm install -D prisma
```

Expected: both packages added to `package.json` (`@prisma/client` under `dependencies`, `prisma` under `devDependencies`).

- [ ] **Step 6: Scaffold `prisma/schema.prisma`**

Create `manikya-backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- [ ] **Step 7: Validate the schema**

```bash
npx prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 8: Commit**

```bash
git add .gitignore package.json package-lock.json prisma/schema.prisma
git commit -m "chore: install Prisma and configure Supabase datasource"
```

---

### Task 2: Full schema definition and initial migration

**Files:**
- Modify: `manikya-backend/prisma/schema.prisma`

**Interfaces:**
- Consumes: `DATABASE_URL` / `DIRECT_URL` from Task 1's `.env`.
- Produces: 9 Postgres tables (`users`, `business_profiles`, `listings`, `requirements`, `wishlists`, `visits`, `analytics_events`, `jobs`, `job_applications`) and the generated `@prisma/client` types (`PrismaClient`, `User`, `Listing`, `Requirement`, `Job`, `JobApplication`, etc.) that Task 3+ import from `@prisma/client`.

- [ ] **Step 1: Write the full schema**

Replace the contents of `manikya-backend/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id         String   @id @default(cuid())
  name       String
  email      String   @unique
  phone      String   @unique
  city       String?
  avatarUrl  String?  @map("avatar_url")
  roles      String[] @default([])
  activeView String   @default("personal") @map("active_view")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @default(now()) @updatedAt @map("updated_at")

  businessProfile BusinessProfile?
  listings        Listing[]
  requirements    Requirement[]
  wishlists       Wishlist[]
  visits          Visit[]
  analyticsEvents AnalyticsEvent[]
  jobApplications JobApplication[]

  @@map("users")
}

model BusinessProfile {
  id              String   @id @default(cuid())
  userId          String   @unique @map("user_id")
  companyName     String?  @map("company_name")
  logoUrl         String?  @map("logo_url")
  licenseNumber   String?  @map("license_number")
  experienceYears Int      @default(0) @map("experience_years")
  coverageAreas   String[] @default([]) @map("coverage_areas")
  specialities    String[] @default([])
  languages       String[] @default([])
  bio             String?
  createdAt       DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("business_profiles")
}

model Listing {
  id          String   @id @default(cuid())
  ownerId     String   @map("owner_id")
  title       String
  category    String
  world       String   @default("residential")
  price       String
  priceLabel  String?  @map("price_label")
  location    String
  locality    String?
  images      String[] @default([])
  rating      Decimal  @default(5.0) @db.Decimal(3, 2)
  badge       String   @default("New Listing")
  verified    Boolean  @default(false)
  noBrokerage Boolean  @default(true) @map("no_brokerage")
  details     Json?
  status      String   @default("live")
  createdAt   DateTime @default(now()) @map("created_at")

  owner           User             @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  wishlists       Wishlist[]
  visits          Visit[]
  analyticsEvents AnalyticsEvent[]

  @@map("listings")
}

model Requirement {
  id            Int      @id @default(autoincrement())
  seekerId      String?  @map("seeker_id")
  role          String
  category      String?
  name          String
  city          String
  areas         String[] @default([])
  budgetMin     Int      @map("budget_min")
  budgetMax     Int      @map("budget_max")
  budgetLabel   String   @map("budget_label")
  moveIn        String?  @map("move_in")
  bhk           String?
  furnishing    String?
  notes         String?
  tags          String[] @default([])
  responseCount Int      @default(0) @map("response_count")
  verified      Boolean  @default(false)
  postedAt      String   @map("posted_at")
  status        String   @default("active")

  seeker User? @relation(fields: [seekerId], references: [id], onDelete: Cascade)

  @@map("requirements")
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  listingId String?  @map("listing_id")
  jobId     String?  @map("job_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing? @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId, jobId])
  @@map("wishlists")
}

model Visit {
  id        String   @id @default(cuid())
  visitorId String   @map("visitor_id")
  listingId String   @map("listing_id")
  visitTime DateTime @map("visit_time")
  status    String   @default("pending")
  createdAt DateTime @default(now()) @map("created_at")

  visitor User    @relation(fields: [visitorId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("visits")
}

model AnalyticsEvent {
  id        String   @id @default(cuid())
  listingId String   @map("listing_id")
  visitorId String?  @map("visitor_id")
  eventType String   @map("event_type")
  createdAt DateTime @default(now()) @map("created_at")

  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  visitor User?   @relation(fields: [visitorId], references: [id], onDelete: SetNull)

  @@map("analytics_events")
}

model Job {
  id       String @id
  title    String
  company  String
  location String
  salary   String
  logo     String
  category String

  applications JobApplication[]

  @@map("jobs")
}

model JobApplication {
  id        Int      @id @default(autoincrement())
  userId    String   @map("user_id")
  jobId     String   @map("job_id")
  appliedAt DateTime @default(now()) @map("applied_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  job  Job  @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([userId, jobId])
  @@map("job_applications")
}
```

- [ ] **Step 2: Run the initial migration**

```bash
npx prisma migrate dev --name init
```

Expected: output ending in `Your database is now in sync with your schema.` and a new folder `prisma/migrations/<timestamp>_init/migration.sql`. If this fails with a connection error, re-check `DATABASE_URL`/`DIRECT_URL` in `.env` from Task 1.

- [ ] **Step 3: Verify the tables exist**

```bash
npx prisma studio
```

Expected: a browser tab opens at `http://localhost:5555` showing all 9 models in the left sidebar (`User`, `BusinessProfile`, `Listing`, `Requirement`, `Wishlist`, `Visit`, `AnalyticsEvent`, `Job`, `JobApplication`), each with 0 rows. Close the tab/stop the process (Ctrl+C) when confirmed.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: define full Prisma schema and run initial migration"
```

---

### Task 3: Prisma client singleton and seed script

**Files:**
- Create: `manikya-backend/src/lib/prisma.ts`
- Create: `manikya-backend/prisma/seed.ts`
- Modify: `manikya-backend/package.json` (add `"prisma": { "seed": ... }` block)

**Interfaces:**
- Produces: `export const prisma: PrismaClient` from `src/lib/prisma.ts`, imported by `src/services/db.ts` in Task 4.

- [ ] **Step 1: Create the Prisma client singleton**

Create `manikya-backend/src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 2: Write the seed script**

Create `manikya-backend/prisma/seed.ts`. This reproduces exactly the seed data `mockDb.ts` writes on first run today (the demo user Ravi Sharma, and the 3 jobs — including `job-002` already marked applied):

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: "demo-9000000001" },
    update: {},
    create: {
      id: "demo-9000000001",
      name: "Ravi Sharma",
      email: "ravi@findway.demo",
      phone: "9000000001",
      city: "Bengaluru",
      roles: ["owner", "tenant"],
      activeView: "personal",
    },
  });

  const jobs = [
    {
      id: "job-001",
      title: "Frontend Developer (Next.js)",
      company: "Innovate Tech",
      location: "HSR Layout, Bangalore (Hybrid)",
      salary: "₹12L - ₹18L p.a.",
      logo: "IT",
      category: "development",
    },
    {
      id: "job-002",
      title: "Customer Support Specialist",
      company: "Nexus Logistics",
      location: "Koramangala, Bangalore (On-site)",
      salary: "₹4L - ₹6L p.a.",
      logo: "NL",
      category: "support",
    },
    {
      id: "job-003",
      title: "Product Designer (UI/UX)",
      company: "Aether AI",
      location: "Indiranagar, Bangalore (Remote)",
      salary: "₹14L - ₹22L p.a.",
      logo: "AA",
      category: "design",
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({ where: { id: job.id }, update: {}, create: job });
  }

  // job-002 starts pre-applied, matching mockDb.ts's original seed data.
  await prisma.jobApplication.upsert({
    where: { userId_jobId: { userId: "demo-9000000001", jobId: "job-002" } },
    update: {},
    create: { userId: "demo-9000000001", jobId: "job-002" },
  });

  console.log("Seed complete: 1 user, 3 jobs, 1 job application.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Wire up `prisma db seed`**

In `manikya-backend/package.json`, add a top-level `"prisma"` key (sibling to `"scripts"`, `"dependencies"`):

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

- [ ] **Step 4: Run the seed**

```bash
npx prisma db seed
```

Expected: `Seed complete: 1 user, 3 jobs, 1 job application.`

- [ ] **Step 5: Verify in Prisma Studio**

```bash
npx prisma studio
```

Expected: `User` table has 1 row (`demo-9000000001`, Ravi Sharma), `Job` table has 3 rows, `JobApplication` table has 1 row (`demo-9000000001` / `job-002`). Stop the process when confirmed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/prisma.ts prisma/seed.ts package.json
git commit -m "feat: add Prisma client singleton and seed script"
```

---

### Task 4: Data layer for session + listings; swap authController and listingController

**Files:**
- Create: `manikya-backend/src/services/db.ts`
- Modify: `manikya-backend/src/controllers/authController.ts`
- Modify: `manikya-backend/src/controllers/listingController.ts`

**Interfaces:**
- Consumes: `prisma` from `src/lib/prisma.ts` (Task 3).
- Produces: `getSession()`, `updateSession(patch)`, `getListings(category?)`, `addListing(input)`, `deleteListing(id)` — all `async`, from `src/services/db.ts`. Task 5 and Task 6 add more exports to this same file.

- [ ] **Step 1: Create `src/services/db.ts` with the session and listing functions**

Create `manikya-backend/src/services/db.ts`:

```typescript
import { prisma } from "../lib/prisma";

const DEMO_USER_ID = "demo-9000000001";

// ---- Session ----

export interface SessionDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string | null;
  avatarUrl?: string | null;
  roles: string[];
  activeView: string;
}

function toSessionDTO(user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  avatarUrl: string | null;
  roles: string[];
  activeView: string;
}): SessionDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
    activeView: user.activeView,
  };
}

export async function getSession(): Promise<SessionDTO> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: DEMO_USER_ID } });
  return toSessionDTO(user);
}

export async function updateSession(
  patch: Partial<{ name: string; city: string; roles: string[]; avatarUrl: string; activeView: "personal" | "business" }>
): Promise<SessionDTO> {
  const user = await prisma.user.update({ where: { id: DEMO_USER_ID }, data: patch });
  return toSessionDTO(user);
}

// ---- Listings ----

export interface ListingDTO {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  badge: string;
  rating: number;
  category: string;
  ownerId?: string;
}

function toListingDTO(listing: {
  id: string;
  title: string;
  location: string;
  price: string;
  images: string[];
  badge: string;
  rating: unknown;
  category: string;
  ownerId: string;
}): ListingDTO {
  return {
    id: listing.id,
    title: listing.title,
    location: listing.location,
    price: listing.price,
    image: listing.images[0] ?? "/listings/placeholder.jpg",
    badge: listing.badge,
    rating: Number(listing.rating),
    category: listing.category,
    ownerId: listing.ownerId,
  };
}

export async function getListings(category?: string): Promise<ListingDTO[]> {
  const listings = await prisma.listing.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return listings.map(toListingDTO);
}

export async function addListing(input: {
  title: string;
  location: string;
  price: string;
  image: string;
  badge: string;
  rating: number;
  category: string;
  ownerId: string;
}): Promise<ListingDTO> {
  const listing = await prisma.listing.create({
    data: {
      title: input.title,
      location: input.location,
      price: input.price,
      images: [input.image],
      badge: input.badge,
      rating: input.rating,
      category: input.category,
      ownerId: input.ownerId,
    },
  });
  return toListingDTO(listing);
}

export async function deleteListing(id: string): Promise<boolean> {
  try {
    await prisma.listing.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Swap `authController.ts` to the new data layer**

Replace the contents of `manikya-backend/src/controllers/authController.ts`:

```typescript
import { Request, Response } from "express";
import * as db from "../services/db";

export const getSession = async (req: Request, res: Response) => {
  const session = await db.getSession();
  res.json({ success: true, data: session });
};

export const switchProfileMode = async (req: Request, res: Response) => {
  const { mode } = req.body;

  if (mode !== "personal" && mode !== "business") {
    return res.status(400).json({ success: false, error: "Invalid activeView mode" });
  }

  const updated = await db.updateSession({ activeView: mode });
  res.json({ success: true, data: updated });
};

export const updateSession = async (req: Request, res: Response) => {
  const { name, city, roles, avatarUrl } = req.body;
  const updated = await db.updateSession({
    ...(name ? { name } : {}),
    ...(city ? { city } : {}),
    ...(roles ? { roles } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
  });
  res.json({ success: true, data: updated });
};
```

- [ ] **Step 3: Swap `listingController.ts` to the new data layer**

Replace the contents of `manikya-backend/src/controllers/listingController.ts`:

```typescript
import { Request, Response } from "express";
import * as db from "../services/db";

export const getListings = async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const listings = await db.getListings(category);
  res.json({ success: true, data: listings });
};

export const createListing = async (req: Request, res: Response) => {
  const { title, location, price, image, badge, rating, category } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const session = await db.getSession();
  const newListing = await db.addListing({
    title,
    location: location || "Bengaluru",
    price,
    image: image || "/listings/placeholder.jpg",
    badge: badge || "New Listing",
    rating: rating || 5.0,
    category,
    ownerId: session.id,
  });

  res.status(201).json({ success: true, data: newListing });
};

export const deleteListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteListing(id);

  if (!deleted) {
    return res.status(404).json({ success: false, error: "Listing not found" });
  }

  res.json({ success: true, message: "Listing deleted successfully" });
};
```

- [ ] **Step 4: Start the backend**

```bash
cd "C:\Users\mahad\OneDrive\Desktop\new manikya_app\manikya-backend"
npm run dev
```

Expected: the same startup banner as before (`Manikya Nest Backend Server Is Running`, port 4000), no TypeScript errors.

- [ ] **Step 5: Verify session endpoints with curl**

In a second terminal:

```bash
curl http://localhost:4000/api/auth/session
```

Expected: `{"success":true,"data":{"id":"demo-9000000001","name":"Ravi Sharma",...}}`

```bash
curl -X PATCH http://localhost:4000/api/auth/session -H "Content-Type: application/json" -d "{\"city\":\"Mumbai\"}"
curl http://localhost:4000/api/auth/session
```

Expected: second call shows `"city":"Mumbai"`.

- [ ] **Step 6: Verify listings endpoints with curl**

```bash
curl -X POST http://localhost:4000/api/listings -H "Content-Type: application/json" -d "{\"title\":\"Test Flat\",\"location\":\"HSR Layout\",\"price\":\"25000/mo\",\"category\":\"rent\"}"
```

Expected: `201` with `{"success":true,"data":{"id":"...","title":"Test Flat",...,"ownerId":"demo-9000000001"}}`. Copy the returned `id`.

```bash
curl http://localhost:4000/api/listings
```

Expected: array containing the "Test Flat" listing.

```bash
curl -X DELETE http://localhost:4000/api/listings/<id-from-above>
```

Expected: `{"success":true,"message":"Listing deleted successfully"}`. Confirm in `npx prisma studio` that the `Listing` table is empty again (or run `GET /api/listings` and see an empty array).

- [ ] **Step 7: Commit**

```bash
git add src/services/db.ts src/controllers/authController.ts src/controllers/listingController.ts
git commit -m "feat: migrate session and listings to Prisma/Postgres"
```

---

### Task 5: Data layer for jobs; swap jobController

**Files:**
- Modify: `manikya-backend/src/services/db.ts` (append job functions)
- Modify: `manikya-backend/src/controllers/jobController.ts`

**Interfaces:**
- Consumes: `DEMO_USER_ID`, `prisma` already defined in `src/services/db.ts` (Task 4).
- Produces: `getJobs()`, `applyToJob(jobId)` — `async`, appended to `src/services/db.ts`.

- [ ] **Step 1: Append job functions to `db.ts`**

Add to the end of `manikya-backend/src/services/db.ts`:

```typescript

// ---- Jobs ----

export interface JobDTO {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  logo: string;
  category: string;
  applied: boolean;
}

export async function getJobs(): Promise<JobDTO[]> {
  const jobs = await prisma.job.findMany({
    include: { applications: { where: { userId: DEMO_USER_ID } } },
  });
  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    logo: job.logo,
    category: job.category,
    applied: job.applications.length > 0,
  }));
}

export async function applyToJob(jobId: string): Promise<boolean> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return false;

  await prisma.jobApplication.upsert({
    where: { userId_jobId: { userId: DEMO_USER_ID, jobId } },
    create: { userId: DEMO_USER_ID, jobId },
    update: {},
  });
  return true;
}
```

- [ ] **Step 2: Swap `jobController.ts` to the new data layer**

Replace the contents of `manikya-backend/src/controllers/jobController.ts`:

```typescript
import { Request, Response } from "express";
import * as db from "../services/db";

export const getJobs = async (req: Request, res: Response) => {
  const jobs = await db.getJobs();
  res.json({ success: true, data: jobs });
};

export const applyToJob = async (req: Request, res: Response) => {
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ success: false, error: "Missing jobId field" });
  }

  const success = await db.applyToJob(jobId);

  if (!success) {
    return res.status(404).json({ success: false, error: "Job post not found" });
  }

  res.json({ success: true, message: "Job application submitted successfully" });
};
```

- [ ] **Step 3: Restart the backend** (Ctrl+C then `npm run dev` again in the same terminal from Task 4)

- [ ] **Step 4: Verify with curl**

```bash
curl http://localhost:4000/api/jobs
```

Expected: 3 jobs; `job-001` and `job-003` have `"applied":false`, `job-002` has `"applied":true` (seeded).

```bash
curl -X POST http://localhost:4000/api/jobs/apply -H "Content-Type: application/json" -d "{\"jobId\":\"job-001\"}"
curl http://localhost:4000/api/jobs
```

Expected: second call now shows `job-001` with `"applied":true` too.

```bash
curl -X POST http://localhost:4000/api/jobs/apply -H "Content-Type: application/json" -d "{\"jobId\":\"does-not-exist\"}"
```

Expected: `404` with `{"success":false,"error":"Job post not found"}`.

- [ ] **Step 5: Commit**

```bash
git add src/services/db.ts src/controllers/jobController.ts
git commit -m "feat: migrate jobs and job applications to Prisma/Postgres"
```

---

### Task 6: Data layer for requirements; swap requirementsController

**Files:**
- Modify: `manikya-backend/src/services/db.ts` (append requirement functions)
- Modify: `manikya-backend/src/controllers/requirementsController.ts`

**Interfaces:**
- Consumes: `prisma` from `src/services/db.ts` (Task 4).
- Produces: `getRequirements()`, `addRequirement(input)`, `deleteRequirement(id)`, `updateRequirement(input)` — `async`, appended to `src/services/db.ts`.

- [ ] **Step 1: Append requirement functions to `db.ts`**

Add to the end of `manikya-backend/src/services/db.ts`:

```typescript

// ---- Requirements ----

export interface RequirementDTO {
  id: number;
  role: string;
  category?: string | null;
  name: string;
  city: string;
  areas: string[];
  budgetMin: number;
  budgetMax: number;
  budgetLabel: string;
  moveIn?: string | null;
  bhk?: string | null;
  furnishing?: string | null;
  notes?: string | null;
  tags: string[];
  postedAt: string;
  responseCount: number;
  verified: boolean;
}

function toRequirementDTO(r: {
  id: number;
  role: string;
  category: string | null;
  name: string;
  city: string;
  areas: string[];
  budgetMin: number;
  budgetMax: number;
  budgetLabel: string;
  moveIn: string | null;
  bhk: string | null;
  furnishing: string | null;
  notes: string | null;
  tags: string[];
  postedAt: string;
  responseCount: number;
  verified: boolean;
}): RequirementDTO {
  return {
    id: r.id,
    role: r.role,
    category: r.category,
    name: r.name,
    city: r.city,
    areas: r.areas,
    budgetMin: r.budgetMin,
    budgetMax: r.budgetMax,
    budgetLabel: r.budgetLabel,
    moveIn: r.moveIn,
    bhk: r.bhk,
    furnishing: r.furnishing,
    notes: r.notes,
    tags: r.tags,
    postedAt: r.postedAt,
    responseCount: r.responseCount,
    verified: r.verified,
  };
}

export async function getRequirements(): Promise<RequirementDTO[]> {
  const reqs = await prisma.requirement.findMany({ orderBy: { id: "desc" } });
  return reqs.map(toRequirementDTO);
}

export async function addRequirement(input: Omit<RequirementDTO, "id">): Promise<RequirementDTO> {
  const r = await prisma.requirement.create({
    data: {
      role: input.role,
      category: input.category ?? undefined,
      name: input.name,
      city: input.city,
      areas: input.areas ?? [],
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      budgetLabel: input.budgetLabel,
      moveIn: input.moveIn ?? undefined,
      bhk: input.bhk ?? undefined,
      furnishing: input.furnishing ?? undefined,
      notes: input.notes ?? undefined,
      tags: input.tags ?? [],
      postedAt: input.postedAt,
      responseCount: input.responseCount ?? 0,
      verified: input.verified ?? false,
    },
  });
  return toRequirementDTO(r);
}

export async function deleteRequirement(id: number): Promise<boolean> {
  try {
    await prisma.requirement.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function updateRequirement(input: RequirementDTO): Promise<boolean> {
  try {
    await prisma.requirement.update({
      where: { id: input.id },
      data: {
        role: input.role,
        category: input.category ?? undefined,
        name: input.name,
        city: input.city,
        areas: input.areas,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        budgetLabel: input.budgetLabel,
        moveIn: input.moveIn ?? undefined,
        bhk: input.bhk ?? undefined,
        furnishing: input.furnishing ?? undefined,
        notes: input.notes ?? undefined,
        tags: input.tags,
        postedAt: input.postedAt,
        responseCount: input.responseCount,
        verified: input.verified,
      },
    });
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Swap `requirementsController.ts` to the new data layer**

Replace the contents of `manikya-backend/src/controllers/requirementsController.ts`:

```typescript
import { Request, Response } from "express";
import * as db from "../services/db";

export const getRequirements = async (req: Request, res: Response) => {
  const reqs = await db.getRequirements();
  res.json({ success: true, data: reqs });
};

export const createRequirement = async (req: Request, res: Response) => {
  const newReq = await db.addRequirement(req.body);
  res.status(201).json({ success: true, data: newReq });
};

export const deleteRequirement = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid requirement ID" });
  }

  const deleted = await db.deleteRequirement(id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: "Requirement not found" });
  }

  res.json({ success: true, message: "Requirement deleted successfully" });
};

export const updateRequirement = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid requirement ID" });
  }

  const updatedReq = { ...req.body, id };
  const updated = await db.updateRequirement(updatedReq);

  if (!updated) {
    return res.status(404).json({ success: false, error: "Requirement not found" });
  }

  res.json({ success: true, data: updatedReq });
};
```

- [ ] **Step 3: Restart the backend**

- [ ] **Step 4: Verify with curl**

```bash
curl -X POST http://localhost:4000/api/requirements -H "Content-Type: application/json" -d "{\"role\":\"tenant\",\"name\":\"Test User\",\"city\":\"Bengaluru\",\"areas\":[\"HSR Layout\"],\"budgetMin\":10000,\"budgetMax\":15000,\"budgetLabel\":\"10k-15k/mo\",\"tags\":[],\"postedAt\":\"Just now\",\"responseCount\":0}"
```

Expected: `201` with the created requirement, `"id"` is a small integer (e.g. `1`).

```bash
curl http://localhost:4000/api/requirements
```

Expected: array containing the requirement just created.

```bash
curl -X PUT http://localhost:4000/api/requirements/1 -H "Content-Type: application/json" -d "{\"role\":\"tenant\",\"name\":\"Test User\",\"city\":\"Bengaluru\",\"areas\":[\"HSR Layout\"],\"budgetMin\":10000,\"budgetMax\":20000,\"budgetLabel\":\"10k-20k/mo\",\"tags\":[],\"postedAt\":\"Just now\",\"responseCount\":0}"
```

(Replace `1` with whatever id was returned above.) Expected: `{"success":true,"data":{...,"budgetMax":20000,...}}`.

```bash
curl -X DELETE http://localhost:4000/api/requirements/1
```

Expected: `{"success":true,"message":"Requirement deleted successfully"}`.

- [ ] **Step 5: Commit**

```bash
git add src/services/db.ts src/controllers/requirementsController.ts
git commit -m "feat: migrate requirements to Prisma/Postgres"
```

---

### Task 7: Delete the file-based mock database and run full end-to-end verification

**Files:**
- Delete: `manikya-backend/src/services/mockDb.ts`
- Delete: `manikya-backend/data/` (including `data/db.json`)

**Interfaces:**
- Consumes: nothing new — this task only removes dead code now that Tasks 4-6 have replaced every caller of `mockDb.ts`.

- [ ] **Step 1: Confirm nothing still imports `mockDb`**

```bash
cd "C:\Users\mahad\OneDrive\Desktop\new manikya_app\manikya-backend"
grep -r "mockDb" src
```

Expected: no output (no matches). If anything matches, it's a controller Task 4-6 missed — go back and swap its import to `../services/db` before continuing.

- [ ] **Step 2: Delete the old mock database files**

```bash
rm src/services/mockDb.ts
rm -rf data
```

- [ ] **Step 3: Restart the backend and confirm it still boots**

```bash
npm run dev
```

Expected: same startup banner, no errors about missing `data/db.json` or `fs` (the new code never references either).

- [ ] **Step 4: Re-verify persistence survives a restart**

```bash
curl http://localhost:4000/api/auth/session
```

Expected: still returns Ravi Sharma with `city: "Mumbai"` (or whatever Task 4's PATCH left it as) — proving the data lives in Postgres, not in server memory or a file that was just deleted.

- [ ] **Step 5: Frontend end-to-end smoke test**

In a separate terminal, start the frontend:

```bash
cd "C:\Users\mahad\OneDrive\Desktop\new manikya_app\manikya-nest-next"
npm run dev
```

With the backend from Step 3 still running, open `http://localhost:3000/profile` in a browser:
1. Confirm the profile loads with the synced session (name/city from the backend, e.g. "Mumbai" if you PATCHed it in Task 4).
2. Go to `http://localhost:3000/requirements`, submit a new requirement through the form.
3. Confirm it appears at the top of the requirements feed.
4. Run `npx prisma studio` (in `manikya-backend`) and confirm the new requirement row exists in the `Requirement` table.

(Listings and jobs are not wired to any frontend page yet — Steps 6/7 of Tasks 4 and 5 already verified those via curl; no frontend click-through exists for them.)

- [ ] **Step 6: Commit**

```bash
cd "C:\Users\mahad\OneDrive\Desktop\new manikya_app\manikya-backend"
git add -A
git commit -m "chore: remove file-based mock database, cutover complete"
```
