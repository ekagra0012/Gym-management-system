# Gym Management System — Backend API

A comprehensive gym management backend built with **NestJS** and **PostgreSQL**. Manages members, trainers, membership plans, subscriptions, attendance tracking, and payments.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger / OpenAPI

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/ekagra0012/Gym-management-system.git
cd Gym-management-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Create the database
psql -d postgres -c "CREATE DATABASE gym_management;"

# Start the development server
npm run start:dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database user | — |
| `DB_PASSWORD` | Database password | — |
| `DB_NAME` | Database name | `gym_management` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | JWT token expiry | `1d` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `development` |

## API Modules

| Module | Description |
|--------|-------------|
| **Auth** | JWT authentication with role-based access control |
| **Members** | Member profiles and management |
| **Trainers** | Trainer profiles and specializations |
| **Membership Plans** | Plan creation with pricing and duration |
| **Subscriptions** | Member-plan linking with auto-expiry |
| **Attendance** | Check-in / check-out tracking |
| **Payments** | Payment recording and status tracking |
| **Dashboard** | Aggregated stats and analytics |

## Scripts

```bash
npm run start:dev    # Development with hot-reload
npm run start        # Production start
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
```

## Project Structure

```
src/
├── auth/              # Authentication & authorization
├── members/           # Member management
├── trainers/          # Trainer management
├── membership-plans/  # Plan management
├── subscriptions/     # Subscription management
├── attendance/        # Attendance tracking
├── payments/          # Payment recording
├── dashboard/         # Analytics & reporting
├── app.module.ts      # Root application module
└── main.ts            # Application entry point
```

## License

MIT
