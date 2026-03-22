# WellVantage Gym Management System — Backend API

> Built with **NestJS** + **PostgreSQL** + **TypeORM** + **JWT Authentication**
> This is a **backend-only** submission. No frontend required.
> All testing is done via **Swagger UI** at `http://localhost:3000/api/docs`

---

## What This App Does

WellVantage is a backend API for gym trainers to manage their work digitally. It supports exactly **5 features (screens)**:

| Screen | What It Does | Key Endpoint |
|--------|-------------|--------------|
| **Sign Up** | Trainer creates account via email/password or Google OAuth | `POST /api/auth/register` |
| **Workout List** | Lists all saved workout plans (custom + prebuilt) | `GET /api/workout-plans` |
| **Add Workout Plan** | Creates a plan with nested days and exercises in one request | `POST /api/workout-plans` |
| **Set Availability** | Trainer opens calendar time slots with optional repeat | `POST /api/availability` |
| **Book Client Slots** | Trainer assigns a client to an open slot | `POST /api/bookings` |

**Two user roles:**
- `PT` — Personal Trainer. Can only see and manage their **own** data.
- `OWNER` — Gym owner. Can see **all** trainers' data.

**Clients are NOT users.** They don't log in. They are data records (`POST /api/clients`) owned by a trainer.

---

## Quick Start — Docker (Recommended)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# 1. Clone
git clone https://github.com/ekagra0012/Gym-management-system.git
cd Gym-management-system

# 2. Configure environment
cp .env.example .env
# The default values in .env.example work as-is for Docker. No edits needed.

# 3. Start everything
docker-compose up --build
```

Wait for:
```
app_1  | 🚀 Gym Management API running on http://localhost:3000/api
app_1  | 📚 Swagger UI: http://localhost:3000/api/docs
```

The database is **automatically created**, tables are migrated, and prebuilt workout plans are seeded on first boot.

**→ Open Swagger: http://localhost:3000/api/docs**

---

## Manual Setup (Without Docker)

**Prerequisites:** Node.js 20+, PostgreSQL 15 running locally.

```bash
npm install
cp .env.example .env
# Edit .env: set DB_HOST=localhost and your postgres credentials
npm run start:dev
```

> **Note:** Without Docker, run `psql` and create the database: `CREATE DATABASE wellvantage;`
> Then run the seed to insert prebuilt plans: `npm run seed`

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `db` (Docker) / `localhost` (manual) |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Postgres username | `postgres` |
| `DB_PASSWORD` | Postgres password | `postgres` |
| `DB_NAME` | Database name | `wellvantage` |
| `JWT_SECRET` | Secret for signing JWT tokens | `supersecretkey` |
| `JWT_EXPIRES_IN` | Token validity | `7d` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | Optional |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Optional |

**Note on Google OAuth:** If credentials are missing or placeholder values, `GET /api/auth/google` returns a clean fallback message. The app **never crashes** without Google credentials. All 5 screens are fully testable using email/password login.

---

## How to Test — Step by Step

### Step 1: Open Swagger
Go to: **http://localhost:3000/api/docs**

### Step 2: Create a PT Account
Expand `POST /api/auth/register` → Click **Try it out** → paste:
```json
{
  "email": "john@test.com",
  "password": "Test1234!",
  "role": "PT"
}
```
Click **Execute** → you get `201` with `{ user: { id, email, role: "PT" }, token: "eyJ..." }`

### Step 3: Authorize Swagger
Copy the `token` value. Click the **Authorize 🔒** button at the top. Paste the token. Click **Authorize**.

All subsequent requests will now be authenticated.

### Step 4: Test Screen 2 — View Workout Plans
`GET /api/workout-plans` → Returns array including:
- `"Beginner's Workout - 3 Days"` (isPrebuilt: true)
- `"Beginner's Full Body - 1 Day"` (isPrebuilt: true)

### Step 5: Test Screen 3 — Create a Workout Plan
`POST /api/workout-plans`:
```json
{
  "name": "My Custom Plan",
  "totalDays": 1,
  "notes": "Eat oats. Stay hydrated.",
  "days": [
    {
      "dayNumber": 1,
      "label": "Chest",
      "exercises": [
        { "name": "Bench Press", "sets": 3, "reps": "10" },
        { "name": "Planks", "sets": 3, "reps": "30 secs" }
      ]
    }
  ]
}
```
Returns `201` with nested `days` and `exercises` in the response. Copy the plan `id`.

### Step 6: Test Screen 4 — Set Availability
`POST /api/availability`:
```json
{
  "date": "2026-04-01",
  "startTime": "11:30",
  "endTime": "11:45",
  "sessionName": "PT Session",
  "isRepeat": true,
  "repeatDates": ["2026-04-02", "2026-04-03"]
}
```
This creates **3 separate slots** in one request (matching the "Repeat Sessions" toggle in the UI). Each slot has `status: "OPEN"`. Copy one slot `id`.

### Step 7: Test Screen 5 — Book a Client

First, add a client record:
```json
POST /api/clients
{ "firstName": "Alice", "lastName": "Test", "email": "alice@test.com", "phone": "9876543210" }
```
Copy the client `id`.

Then book:
```json
POST /api/bookings
{
  "availabilityId": "paste-slot-id-here",
  "clientId": "paste-client-id-here"
}
```
Returns `201`. The slot status changes to `BOOKED`.

**Try booking the same slot again → you get `409 Conflict` (double-booking prevented).**

---

## Testing Owner vs PT RBAC

```bash
# 1. Register an OWNER
POST /api/auth/register  →  { "email": "owner@test.com", "password": "Test1234!", "role": "OWNER" }
POST /api/auth/login     →  copy OWNER token → Authorize Swagger with it

# 2. As OWNER: GET /api/workout-plans
#    → Sees ALL plans from ALL trainers ✅

# 3. Switch back to PT token: GET /api/workout-plans
#    → Sees ONLY their own plans ✅

# 4. As PT: DELETE /api/workout-plans/{prebuilt-plan-id}
#    → 403 Forbidden ✅

# 5. As OWNER: DELETE /api/workout-plans/{prebuilt-plan-id}
#    → 200 Success ✅
```

---

## Architecture

```
src/
├── auth/           # JWT strategy, Google OAuth fallback, guards, decorators
├── users/          # User entity — roles: OWNER or PT only
├── clients/        # Client records owned by a trainer (NOT login users)
├── workout-plans/  # WorkoutPlan → WorkoutDay → Exercise (deep nested CRUD)
├── availability/   # Calendar slots with repeat date support
├── bookings/       # Links Clients ↔ Availability slots (pessimistic_write lock)
├── seed/           # Inserts prebuilt plans on boot (idempotent)
└── database/
    ├── typeorm.config.ts     # Standalone DataSource for TypeORM CLI
    └── migrations/           # Schema migrations (synchronize: false)
```

### Database Tables
| Table | Description |
|-------|-------------|
| `users` | All accounts. Enum role: `OWNER` or `PT` only |
| `clients` | Data records linked to a trainer via `trainerId` FK |
| `workout_plans` | Templates. `isPrebuilt` marks system-seeded plans |
| `workout_days` | Sub-entity of a plan (`dayNumber`, `label`) |
| `exercises` | Sub-entity of a day (`sets`: int nullable, `reps`: string) |
| `availability` | Calendar slots. Status: `OPEN` or `BOOKED` |
| `bookings` | Links `clientId` + `availabilityId` + `trainerId` |

---

## Key Business Rules

1. A PT can **never** see another PT's workout plans, clients, availability, or bookings
2. An OWNER can see and manage **everything**
3. A slot can only be booked once → `409 Conflict` on duplicate
4. Booking a slot sets status to `BOOKED`; cancelling resets it to `OPEN`
5. Prebuilt workout plans **cannot** be deleted by PT role → `403 Forbidden`
6. Workout plan `notes` are limited to **50 words** (custom validator)
7. Repeat availability creates **separate DB rows** per date
8. `trainerId` is **always** set from the JWT — never from the request body

---

## NPM Scripts

```bash
npm run start:dev        # Start with hot reload
npm run build            # Compile TypeScript → dist/
npm run seed             # Insert prebuilt workout plans (idempotent)
npm run migration:run    # Apply pending migrations
npm run migration:generate -- src/database/migrations/Name
```

---

## Postman

Import the collection from `wellvantage.postman_collection.json` if provided.
Set `{{base_url}}` = `http://localhost:3000` and `{{token}}` = your JWT.
