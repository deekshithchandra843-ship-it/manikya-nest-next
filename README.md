# FindWay — Real Estate & Accommodation Platform

FindWay is a comprehensive real estate platform split into a **Next.js Frontend** and an **Express.js API Backend** powered by a **PostgreSQL** database via **Prisma ORM** and **Supabase Auth**.

> [!WARNING]
> **Security Notice**: Secrets and API keys (such as the Supabase URL, Anon Key, and PostgreSQL connection passwords) were previously hardcoded in the source code. While they have been moved to environment variables, the old values remain in the git history. **You must rotate any previously hardcoded secrets immediately** before deploying to production.

---

## 📂 Project Structure & Architecture

```
new manikya_app/
│
├── manikya-backend/              # Express + TypeScript API Server (Port 4000)
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma Schema (PostgreSQL Models)
│   │   └── migrations/           # PostgreSQL Migration history
│   ├── src/
│   │   ├── controllers/          # HTTP request controllers
│   │   ├── routes/
│   │   │   └── api.ts            # Routes configuration
│   │   ├── services/
│   │   │   └── db.ts             # Prisma database client queries
│   │   └── server.ts             # Server listener entry point
│
└── manikya-nest-next/            # Next.js Frontend (Port 3000)
    ├── src/
    │   ├── app/                  # Next.js App Router (Explore, CRM, Profile)
    │   ├── components/           # Reusable UI component libraries
    │   └── lib/
    │       ├── apiClient.ts      # Axios dynamic interceptor client
    │       └── auth.ts           # Authentication session synchronization
```

---

## ⚙️ Getting Started

### 1. Run the Express Backend
Ensure you configure the `.env` database URL variables first inside the `manikya-backend` directory, then run:
```bash
# Apply database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### 2. Run the Next.js Frontend
Navigate to `manikya-nest-next` and run:
```bash
# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

---

## 🔄 End-to-End System Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant FE as Next.js Frontend (React)
    participant Auth as auth.ts / apiClient.ts
    participant API as Express API Server (App/Routes)
    participant Ctrl as Route Controller
    participant DB as Prisma db.ts Service
    participant PG as PostgreSQL Database

    User->>FE: Updates Profile Details (clicks Save)
    FE->>Auth: updateSession({ name, city, avatarUrl })
    Note over Auth: Writes update to local localStorage cache
    Auth->>API: PATCH /api/auth/session (JSON body)
    API->>Ctrl: authController.updateSession(req, res)
    Ctrl->>DB: updateSession(patchData)
    DB->>PG: prisma.user.update(where: {id}, data: patchData)
    PG-->>DB: Returns updated database record
    DB-->>Ctrl: Returns SessionDTO
    Ctrl-->>Auth: Responds with JSON { success: true, data: user }
    Auth-->>FE: Dispatches findway:session event
    FE-->>User: UI updates instantly with new details
```

---

## 📊 Database Relationships (Prisma)

```mermaid
erDiagram
    User ||--o{ Requirement : "posts"
    User ||--o{ Listing : "lists"
    User ||--o{ JobApplication : "applies"
    Job ||--o{ JobApplication : "receives"

    User {
        String id PK
        String name
        String email UK
        String phone UK
        String city
        String activeView
        String avatarUrl
        String[] roles
        DateTime createdAt
        DateTime updatedAt
    }

    Requirement {
        Int id PK
        String role
        String category
        String name
        String city
        String[] areas
        Decimal budgetMin
        Decimal budgetMax
        String budgetLabel
        String moveIn
        String bhk
        String furnishing
        String notes
        String[] tags
        String postedAt
        Int responseCount
        Boolean verified
    }

    Listing {
        String id PK
        String title
        String location
        String price
        String[] images
        String badge
        Decimal rating
        String category
        String ownerId FK
        DateTime createdAt
    }
```
