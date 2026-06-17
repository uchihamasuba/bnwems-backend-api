# BNWEMS Backend API

REST API for the **Binh Nguyen Wedding Event Management System (BNWEMS)**, built with Node.js v22 + Express.js + Prisma ORM + MySQL 8.0 + TypeScript.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v22 LTS |
| Framework | Express.js 4.x |
| ORM | Prisma 6.x |
| Database | MySQL 8.0+ |
| Language | TypeScript 5.x |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Testing | Jest + ts-jest + Supertest |

## Quick Start

### Prerequisites

- Node.js v22+
- MySQL 8.0+ running locally (via MySQL Workbench)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in your values
cp .env.example .env

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run database migrations (requires DB to be running)
npm run prisma:migrate

# 5. Start development server
npm run dev
```

The API will be available at: `http://localhost:3001/api/v1`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with ts-node |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run test` | Run all Jest unit & integration tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate` | Apply pending migrations to MySQL |
| `npm run prisma:studio` | Open Prisma Studio (visual DB explorer) |

## Project Structure

```
backend-api/
├── prisma/
│   └── schema.prisma          # Database schema (24 entities, MySQL)
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma singleton client
│   │   └── env.ts             # Environment variable loader
│   ├── controllers/           # HTTP request handlers (delegate to services)
│   ├── services/              # Business logic + Prisma queries
│   ├── routes/                # Express router definitions
│   ├── middlewares/
│   │   ├── auth.middleware.ts # JWT verification + RBAC
│   │   ├── error.middleware.ts# Global error handler
│   │   └── validation.middleware.ts
│   ├── app.ts                 # Express app factory
│   └── server.ts              # Server entry point
└── tests/                     # Jest unit & integration tests
    ├── auth.test.ts
    ├── user.test.ts
    └── order.test.ts
```

## API Base URL

All endpoints are prefixed with: `/api/v1`

| Module | Routes |
|--------|--------|
| Authentication | `/auth/login`, `/auth/change-password` |
| User Management | `/admin/users` |
| Policy Config | `/admin/policies` |
| Equipment | `/equipment` |
| Customers | `/customers` |
| Orders & Quotations | `/orders`, `/quotations` |
| Surveys | `/surveys` |
| Inventory | `/inventory`, `/operations` |
| Field Operations | `/field` |
| Payments | `/payments`, `/settlements` |
| Attendance | `/attendance` |

## Running Tests

```bash
npm run test
```

Tests are located in the `/tests` directory and use Jest + ts-jest for TypeScript support. Prisma client is mocked in all unit tests to avoid requiring a real database connection.
