<div align="center">

# 🏥 MediCore Hospital Management System

**A full-stack hospital app for patients, doctors, reception, pharmacy, lab and administration.**

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

</div>

---

## ✨ Why MediCore?

A hospital day touches many hands: reception checks patients in, doctors see appointments and write prescriptions, pharmacy fills them, lab orders tests, and administration keeps the whole thing running. MediCore gives each of those roles one app, with role-gated pages so people only see the part of the workflow they own.

The stack is deliberately conventional — Express and Mongoose behind a React + Vite client — but the auth is done properly: a short-lived JWT access token paired with an httpOnly refresh cookie. Zod validates input, and the demo seed makes every role explorable in a couple of commands.

### 🧩 What's inside

- 🔑 **Public landing, registration, sign-in and password reset.**
- 👥 **Patient, doctor and staff directories.**
- 📅 **Appointments and visit records.**
- 💊 **Prescriptions, pharmacy inventory and lab orders.**
- 🛡️ **Role-gated pages** for admin, doctor, receptionist, pharmacist, lab tech and patient.
- 🔁 **JWT access token + httpOnly refresh cookie**, with role checks on protected routes.

---

## 🚀 Quick start

Requirements: Node.js 20+ and MongoDB running locally (or a MongoDB Atlas connection string).

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env` expects `MONGODB_URI` (default `mongodb://127.0.0.1:27017/medicore`) and a long `JWT_SECRET`. The API listens on port 4000; the Vite dev server listens on 5173 and proxies `/api` to it.

```bash
npm run seed
npm run dev
```

Open http://localhost:5173. `npm run seed` clears the MediCore collections and loads demo data. Password for every demo account: `Password123!`

| Role | Email |
| --- | --- |
| Admin | `admin@medicore.local` |
| Receptionist | `maya@medicore.local` |
| Pharmacist | `pharmacy@medicore.local` |
| Lab tech | `lab@medicore.local` |
| Doctor | `amelia@medicore.local` |
| Patient | `john@medicore.local` |

Other seeded doctors: `rajesh@medicore.local`, `sarah@medicore.local`, `marcus@medicore.local` and `priya@medicore.local`.

---

## 🧱 Stack

| Layer | Tech |
| --- | --- |
| Client | React 19, Vite 6, React Router, TanStack Query, Zustand, Tailwind CSS |
| Server | Node.js, Express, Mongoose, Zod |
| Auth | JWT access token and httpOnly refresh cookie, role checks |
| Database | MongoDB |

---

## ✅ Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API and Vite together |
| `npm run dev:server` | API only |
| `npm run dev:client` | Vite only |
| `npm run seed` | Reset and load demo data |
| `npm test` | Server auth tests and the client button test |
| `npm run lint` | ESLint |
| `npm run build` | Production client build |

---

## 🗺 Roadmap ideas

- 📄 Patient-facing visit summaries and downloadable prescriptions
- 📧 Email/SMS appointment reminders
- 📊 Inventory alerts for low-stock pharmacy items
- 🧪 Broader API test coverage across roles

---

<div align="center">

One hospital day, six roles, one codebase. Built with React, Express and MongoDB.

</div>
