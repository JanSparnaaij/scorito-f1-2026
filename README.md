# F1 2026 Scorito Helper

A helper application for the [Scorito](https://scorito.com) F1 2026 fantasy game. Browse the 2026 driver lineup, check Scorito points, view race results, and build your optimal 8-driver team using slot multipliers (P1..P8 ×8..×1).

## Scoring: Scorito vs FIA

- **Scorito**: Custom points per position/category, with multipliers for team selection slots. See `/config/scoring.json` (source of truth) and `/docs/scoring.md` for full details and computation examples.
- **FIA**: Standard 25–18–15–12–10–8–6–4–2–1 (not used here).

**This app always uses Scorito points.**

## Features

- 📋 **Driver list** — all 22 F1 2026 drivers with category, team, and computed Scorito points
- 🏎️ **Race calendar** — full 2026 season schedule with results
- 🏆 **Team Builder** — select 8 drivers with P1..P8 multipliers (×8..×1)
- 🔄 **OpenF1 sync** — pull official historical results from [openf1.org](https://openf1.org)
- 📊 **Scorito scoring** — per-category tables, DNF=0, multiplier toggle (race/total)
- 💡 **Recommendations** — top per category, greedy per slot
- 📤 **Export** — CSV of current table

## Tech Stack

| Layer     | Technology                               |
|-----------|------------------------------------------|
| Frontend  | Vite + React + TypeScript + Tailwind CSS + shadcn/ui |
| Backend   | Node.js + Fastify                        |
| Database  | PostgreSQL + Prisma ORM                  |
| Monorepo  | pnpm workspaces + Turborepo              |

## See Also
- `/config/scoring.json` — Scorito tables, multiplier toggle
- `/docs/scoring.md` — Scoring rules, computation, Scorito vs FIA
| Deploy    | Frontend → Vercel · Backend → Railway   |

## Project Structure

```
├── apps/
│   ├── web/          # React frontend (Vite)
│   └── server/       # Fastify REST API
├── packages/
│   ├── core/         # Shared TypeScript types & scoring logic
│   └── db/           # Prisma schema + client
├── .env.example
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm 8
- PostgreSQL database (or [Railway](https://railway.app))

### Installation

```bash
# Install dependencies
pnpm install

# Copy env files
cp .env.example .env
cp apps/web/.env.example apps/web/.env

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data (drivers + schedule)
pnpm db:seed

# Start dev servers
pnpm dev
```

### API Endpoints

| Method | Path                          | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/api/drivers`                | List all drivers with prices       |
| GET    | `/api/drivers/:id`            | Driver detail + race results       |
| GET    | `/api/constructors`           | List all constructors              |
| GET    | `/api/races`                  | List 2026 race calendar            |
| GET    | `/api/races/:slug`            | Race detail + results              |
| GET    | `/api/prices`                 | All prices                         |
| POST   | `/api/drivers/sync`           | Sync drivers from OpenF1           |
| POST   | `/api/races/sync`             | Sync race schedule from OpenF1     |
| POST   | `/api/results/sync/:raceSlug` | Sync race results from OpenF1      |
| POST   | `/api/prices/seed`            | Seed Scorito prices (JSON body)    |

## Scoring Configuration

```typescript
racePoints:   P1=25, P2=18, P3=15, P4=12, P5=10, P6=8, P7=6, P8=4, P9=2, P10=1
poleBonus:    +5 pts
fastestLap:   +5 pts (top 10 finish only)
driverOfDay:  +3 pts
dnfPenalty:   −5 pts
```

## Deployment

### Frontend (Vercel)
1. Connect the GitHub repo to Vercel
2. Set **Root Directory** to `apps/web`
3. Set `VITE_API_URL` environment variable to your Railway backend URL

### Backend (Railway)
1. Connect the GitHub repo to Railway
2. Set `DATABASE_URL` to your Railway Postgres URL
3. Set `FRONTEND_URL` to your Vercel frontend URL
4. Set `PORT` to `3000` (Railway sets this automatically)
