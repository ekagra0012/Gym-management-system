# WellVantage Gym Management System - Backend API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

A robust, scalable backend for the WellVantage mobile application, built with **NestJS** and **PostgreSQL**. The platform handles trainer availability management, client onboarding, workout plan generation (including nested exercises), and secure scheduling mechanisms.

---

## 📑 Table of Contents

1. [Architecture & Diagrams](#-architecture--diagrams)
   - [System Architecture](#system-architecture)
   - [Database Entity Relationship Diagram (ERD)](#database-erd)
   - [Authentication & RBAC Flow](#authentication--rbac)
   - [Repeat Availability Generation Flow](#repeat-availability-flow)
   - [Booking & Double-Booking Prevention](#double-booking-prevention)
2. [API Reference & Endpoints](#-api-reference)
3. [Business Logic Details](#-business-rules--logic)
4. [Environment Setup](#-environment-variables)
5. [Quick Start & Scripts](#-quick-start)
6. [Known Limitations](#-known-limitations)

---

## 🏗 Architecture & Diagrams

### System Architecture

The project follows a standard NestJS modular architecture, dividing responsibilities into distinct domain modules while keeping cross-cutting concerns (Auth, DB) accessible globally.

```mermaid
graph TD
    Client[Mobile/Web App] -->|HTTP REST APIs| API[NestJS App]
    
    subgraph NestJS App Architecture
        API --> AuthModule[Auth Module<br>JWT/Google OAuth]
        API --> WorkoutModule[Workout Plans Module]
        API --> ClientModule[Clients Module]
        API --> AvailabilityModule[Availability Module]
        API --> BookingModule[Bookings Module]
        
        AuthModule --> UserModule[Users Module]
        
        WorkoutModule --> TypeORM[TypeORM Service]
        ClientModule --> TypeORM
        AvailabilityModule --> TypeORM
        BookingModule --> TypeORM
        UserModule --> TypeORM
    end
    
    TypeORM --> Postgres[(PostgreSQL 15)]
    
    classDef domain fill:#1E293B,stroke:#94A3B8,stroke-width:2px,color:#fff;
    classDef db fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#fff;
    class AuthModule,WorkoutModule,ClientModule,AvailabilityModule,BookingModule,UserModule domain;
    class Postgres db;
```

### Database ERD

*This ERD reflects the literal columns, constraints, and relationships implemented in the TypeORM entities.*

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar passwordHash "nullable"
        enum role "OWNER | PT"
        timestamp createdAt
        timestamp updatedAt
    }

    workout_plans {
        uuid id PK
        uuid trainer_id FK
        varchar name
        int total_days "default: 1"
        text notes "nullable"
        boolean is_active "default: true"
        boolean is_prebuilt "default: false"
        timestamp created_at
        timestamp updated_at
    }

    workout_days {
        uuid id PK
        uuid workout_plan_id FK
        int day_number
        varchar label "nullable"
    }

    exercises {
        uuid id PK
        uuid workout_day_id FK
        varchar name
        int sets "nullable"
        varchar reps "nullable"
        int order_index "default: 1"
    }

    clients {
        uuid id PK
        varchar firstName
        varchar lastName
        varchar email "nullable"
        varchar phone "nullable"
        uuid trainerId FK
        timestamp createdAt
        timestamp updatedAt
    }

    availability {
        uuid id PK
        uuid trainer_id FK
        date date
        varchar start_time
        varchar end_time
        varchar session_name
        varchar status "OPEN | BOOKED"
        timestamp created_at
        timestamp updated_at
    }

    bookings {
        uuid id PK
        uuid client_id FK
        uuid availability_id FK
        uuid trainer_id FK
        varchar status "CONFIRMED | CANCELLED"
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ workout_plans : "creates"
    users ||--o{ clients : "manages"
    users ||--o{ availability : "sets"
    users ||--o{ bookings : "owns"
    
    workout_plans ||--|{ workout_days : "contains"
    workout_days ||--o{ exercises : "contains"
    
    availability ||--o| bookings : "is booked by"
    clients ||--o{ bookings : "attends"
```

### Authentication & RBAC

The system relies primarily on JWT Bearer strategies with a fallback for Google OAuth. Requests are validated via `JwtAuthGuard`, followed by `RolesGuard` determining PT vs. OWNER-level routes.

```mermaid
sequenceDiagram
    participant App
    participant AuthController
    participant AuthService
    participant UsersService
    participant DB

    App->>AuthController: POST /auth/login {email, password}
    AuthController->>AuthService: validateUser
    AuthService->>UsersService: findByEmail
    UsersService->>DB: Query User
    DB-->>UsersService: User Record (Hash)
    UsersService-->>AuthService: Return User
    AuthService->>AuthService: bcrypt.compare()
    AuthService-->>AuthController: Access Token (JWT)
    AuthController-->>App: { access_token }

    Note over App, DB: Subsequent API Requests
    
    App->>Endpoint: Request + Authorization: Bearer <token>
    Endpoint->>JwtStrategy: Decode Payload
    JwtStrategy->>UsersService: Verify sub (id) exists
    UsersService-->>JwtStrategy: User (Valid)
    JwtStrategy->>RolesGuard: Check Route Roles
    alt Role matches (OWNER / PT)
        RolesGuard-->>Endpoint: Proceed
    else Unauthorized
        RolesGuard-->>App: 403 Forbidden
    end
```

### Repeat Availability Flow

When submitting multi-date availability templates from the client.

```mermaid
flowchart TD
    Req[POST /availability] --> Parse[Extract CreateAvailabilityDto]
    Parse --> IsRepeat{isRepeat == true and <br> repeatDates has length?}
    
    IsRepeat -- Yes --> BuildArray(Array = [date, ...repeatDates])
    IsRepeat -- No --> BuildSingle(Array = [date])
    
    BuildArray --> Loop[Loop Dates]
    BuildSingle --> Loop
    
    Loop --> Check[Check DB for clash:<br>same trainerId + date + startTime]
    
    Check -- Clash Found --> Throw409[Throw 409 ConflictException]
    Check -- Clear --> Push[Push slot obj to createdSlots]
    
    Push --> NextDate{More dates?}
    NextDate -- Yes --> Loop
    NextDate -- No --> SaveDB[TypeORM repo.save(createdSlots)]
    SaveDB --> Res[Return 201]
```

### Double Booking Prevention

The application relies heavily on explicit Postgres pessimistic write locks applied during an ACID transaction to prevent concurrency bugs when booking.

```mermaid
sequenceDiagram
    participant User
    participant BookingsService
    participant QueryRunner
    participant DB

    User->>BookingsService: POST /bookings {availabilityId}
    BookingsService->>QueryRunner: startTransaction()
    BookingsService->>QueryRunner: findOne(Availability, lock: 'pessimistic_write')
    QueryRunner->>DB: SELECT * FROM availability WHERE id=? FOR UPDATE
    
    Note right of DB: Any concurrent request requesting <br> this row will wait sequentially here.
    
    DB-->>QueryRunner: Slot Record
    
    alt slot.status == 'OPEN'
        BookingsService->>QueryRunner: Slot.status = 'BOOKED'
        BookingsService->>QueryRunner: Create Booking Record
        BookingsService->>QueryRunner: commitTransaction()
        QueryRunner->>DB: COMMIT
        BookingsService-->>User: 201 Created (Booking details)
    else slot.status != 'OPEN'
        BookingsService->>QueryRunner: rollbackTransaction()
        BookingsService-->>User: 409 ConflictException ('Slot is already booked')
    end
```

---

## 🧭 API Reference

### Auth Context (`/api/auth`)
| Method | Endpoint | Use Case | Auth Required | Body format |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | Sign up standard user | No | `RegisterDto` { email, password, role? } |
| `POST` | `/login` | Get JWT token | No | `LoginDto` { email, password } |
| `GET` | `/google` | Trigger OAuth | No | - |
| `GET` | `/google/callback` | OAuth callback target | No | - |

### Workout Plans Context (`/api/workout-plans`)
| Method | Endpoint | Use Case | Body format |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Create a tailored or custom plan, supporting multiple days and nested exercises. | `CreateWorkoutPlanDto` |
| `GET` | `/` | Returns user's plans. (If OWNER: all active plans. If PT: own active plans + Global prebuilt plans). | - |
| `GET` | `/:id` | Returns populated plan including nested `days` and `exercises`. | - |
| `DELETE` | `/:id` | Irrevocably destroys a plan. Owners can delete globally. | - |

*(Typical `CreateWorkoutPlanDto` example)*
```json
{
  "name": "Intense Routine",
  "totalDays": 1,
  "notes": "Drink water",
  "days": [
    {
      "dayNumber": 1,
      "label": "Push",
      "exercises": [
        { "name": "Bench Press", "sets": 3, "reps": "10-12" }
      ]
    }
  ]
}
```

### Clients Context (`/api/clients`)
| Method | Endpoint | Use Case | Body format |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Add a client assigned to the caller | `CreateClientDto` { firstName, lastName, email, phone } |
| `GET` | `/` | Return clients assigned to caller | - |
| `GET` | `/:id` | Return specific client data | - |
| `PATCH` | `/:id` | Update client details | `UpdateClientDto` (Partial `CreateClientDto`) |
| `DELETE` | `/:id` | Drop client record | - |

### Availability Context (`/api/availability`)
| Method | Endpoint | Use Case | Body format |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Bulk create schedule slots (Handles repeats) | `CreateAvailabilityDto` { date, startTime, endTime, sessionName, isRepeat, repeatDates[] } |
| `GET` | `/` | Retrieve sorted schedule slots | - |
| `DELETE`| `/:id`| Drop slot **(if open)** | - |

### Bookings Context (`/api/bookings`)
| Method | Endpoint | Use Case | Body format |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Consume availability slot, create booking | `CreateBookingDto` { availabilityId, clientId } |
| `GET` | `/` | List confirmed & cancelled bookings | - |
| `PATCH`| `/:id/cancel`| Sets booking to Cancelled, frees up availability status to OPEN | - |

---

## 🚦 Business Rules & Logic

1. **Role Access Check**
   - The system utilizes two user roles: `OWNER` and `PT`. `OWNER` users can manipulate or query ANY record globally. `PT` users are limited strictly to the domain objects containing their `trainerId`.
2. **Prebuilt Templates**
   - The seeder generates prebuilt workout plans (flagged `isPrebuilt=true`) governed implicitly by a system `OWNER`. All trainers (`PT`) can view these plans, but cannot delete them.
3. **Double Booking Enforcement**
   - Attempting to book a slot utilizes Postgres row-level locks (`SELECT FOR UPDATE` via `pessimistic_write`). This enforces sequential writes to heavily contended time slots.
4. **Availability Collisions**
   - You cannot submit two Availability slots with the same `date` and `startTime` for the same `trainer_id`. Doing so halts the block completely and returns a `409 ConflictException`.
5. **Deleted Plans**
   - Entity models feature soft/hard cascades contextually. Deleting a `WorkoutPlan` or `WorkoutDay` wipes associated exercises entirely via TypeORM cascade structures. Availability slots however, block deletion if their `status` is currently set to `BOOKED`.

---

## ⚙️ Environment Variables

Copy the `.env.example` file to create a root `.env`.

```env
# Database Connections
DB_HOST=localhost       # Use 'db' if running inside docker-compose natively
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=wellvantage

# App Config
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=refreshSecretForDev
JWT_REFRESH_EXPIRES_IN=7d

# Google SSO Keys (Fill to test OAuth flows)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

---

## 🚀 Quick Start

### 1. Requirements

- Node.js version >= `20`
- PostgreSQL version `>= 15`
- Docker (optional)

### 2. Booting Up

To run the full stack effortlessly utilizing docker containers for the database:

```bash
# Start just the database, or everything.
docker-compose up -d db

# Install Node modules
npm install

# Run application (Watch mode)
npm run start:dev
```

### 3. Seeding the Database

In order to populate global templates (`Beginner's Workout` arrays) into your PostgreSQL container, run:

```bash
npm run seed:run
# OR
npm run seed
```

### 4. Important NPM Scripts

| Script | Description |
| :--- | :--- | 
| `npm run start:dev` | Spawns Nest instance mapping to port 3000 |
| `npm run format` | Prettier code format sweep across files |
| `npm run seed:run` | Seeds prebuilt default workout plans into db |
| `npm run test:e2e` | Runs E2E Jest context test parameters |
| `npm run typeorm` | Invokes raw CLI for running TypeORM migrations |

---

## ⚠️ Known Limitations

- **Google OAuth Completion**: Required ENV tokens inside the `.env` (Client Secrets) must be placed physically. Endpoints map properly, but relying solely on JWT Email/Pass fallback is required until setup completes.
- **Refresh Tokens**: Currently, only short-term Access Tokens persist on request validation (`jwt.strategy.ts`). A refresh token cycle has NOT been bound inside controllers.
- **Pagination Missing**: Bulk `GET` routes fetch global lists (`limit: 0`). Large scaling instances will require modifying `clients.service.ts` or `workout-plans.service.ts` to hook offset limitations.
- **File Uploads / Email Notifications**: No file streaming or background job CRON services currently exist for avatar updates or email alerts. 
