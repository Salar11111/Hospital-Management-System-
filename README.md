# MediCore HMS

A full-featured Hospital Management System built with the **MERN** stack (MongoDB, Express, React, Node.js) plus **TypeScript**. It covers staff & patient management, appointments, prescriptions, laboratory orders, pharmacy inventory, medical records, and admin audit logging — all guarded by role-based access control (RBAC) with JWT + httpOnly cookie auth.

## Tech stack

- **Backend** — Node.js, Express 4, Mongoose, Zod (validation), JWT auth, helmet/compression/rate-limit, pino logging
- **Frontend** — React 19, Vite, TypeScript, React Router 7, TanStack Query, Zustand, Tailwind CSS, Recharts
- **Testing** — Jest + ts-jest + Supertest (server), Jest + jsdom + Testing Library (client)
- **Workspaces** — npm workspaces (`server/`, `client/`), single `npm install` from the root

## Prerequisites

- **Node.js ≥ 20**
- **MongoDB** — a locally running instance (default `mongodb://127.0.0.1:27017/medicore`). The server test suite uses your system `mongod` binary when available and falls back to `mongodb-memory-server`.

## Getting started

```bash
npm install
```

### 1. Configure environment

```bash
# Server
cp server/.env.example server/.env

# Client (optional — defaults to /api/v1)
cp client/.env.example client/.env
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4000` | Server port (must match the Vite proxy target) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/medicore` | MongoDB connection string |
| `JWT_SECRET` | — | Secret for signing tokens (use `openssl rand -hex 32` in production) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `COOKIE_SECURE` | `false` | Set `true` when serving over HTTPS |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS origins |

### 2. Seed the database (optional but recommended)

```bash
npm run seed
```

Seeds users, patients, doctors, medicines, appointments, prescriptions, lab orders, and medical records. All seeded accounts use the password **`Password123!`**:

- **Admin** — `admin@medicore.local`
- **Receptionist** — `maya@medicore.local`
- **Pharmacist** — `pharmacy@medicore.local`
- **Lab tech** — `lab@medicore.local`
- **Patient** — `john@medicore.local`, `emma@medicore.local`, `noah@medicore.local`, `sofia@medicore.local`, `liam@medicore.local`
- **Doctors** — `amelia@medicore.local`, `rajesh@medicore.local`, `sarah@medicore.local`, `marcus@medicore.local`, `priya@medicore.local`

### 3. Run it

```bash
npm run dev        # API (http://localhost:4000) + web (http://localhost:5173) concurrently
npm run dev:server # API only
npm run dev:client # Web only (Vite proxies /api to the API)
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run API and web in watch mode |
| `npm run build` | Compile server (`dist/`) then build the client |
| `npm start` | Serve the compiled server (`node dist/index.js`) |
| `npm run seed` | Reset and reseed the database |
| `npm test` | Run server and client test suites |
| `npm run test:server` / `test:client` | Run a single suite |
| `npm run lint` | ESLint across `server/` and `client/` |
| `npm run typecheck` | `tsc` (no emit) across both workspaces |
| `npm run format` | Prettier across both workspaces |

## API overview

All endpoints are prefixed with `/api/v1`. Protected routes use a Bearer-style httpOnly cookie and enforce role-based access.

| Area | Routes | Access |
| --- | --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me` | Public (register depends on config) |
| Users | `/users` | Admin / staff |
| Doctors | `/doctors` | Authenticated |
| Patients | `/patients` | Authenticated |
| Appointments | `/appointments` | Role-scoped (book, confirm, complete, cancel) |
| Prescriptions | `/prescriptions` | Doctors / pharmacists |
| Lab orders | `/lab-orders` | Doctors / lab techs |
| Medicines | `/medicines` | Public read, staff write; low-stock alerts |
| Medical records | `/medical-records` | Role-scoped |
| Admin | `/admin` | Admin only; audit log (`AdminLog`) |
| Health | `/health` | Public |

## Project structure

```
├── server/
│   ├── src/
│   │   ├── config/        # env, DB, logging, constants
│   │   ├── controllers/   # request handlers
│   │   ├── middleware/    # auth, RBAC, validation, errors
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routers
│   │   ├── seed/          # seed script
│   │   ├── validators/    # Zod schemas
│   │   └── __tests__/     # integration tests (Supertest + MongoDB memory/system)
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/    # shared + UI primitives
│   │   ├── layouts/       # AppLayout shell
│   │   ├── pages/         # route views
│   │   ├── services/      # API client
│   │   ├── stores/        # Zustand auth store
│   │   └── lib/           # types, utils, query client
│   └── .env.example
└── package.json
```