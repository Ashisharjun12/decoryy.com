# Decory — local development setup

Monorepo layout:

| Path | What it is |
|------|------------|
| `backend/` | API (Express) + shared DB/Redis |
| `backend/` worker | BullMQ jobs (SMS, email, push, media optimize, payouts, etc.) |
| `app/web/` | Customer web app (Vite) |
| `app/admin/` | Admin panel (Vite) |
| `app/vendor/` | Partner mobile app (Expo) |
| `app/website/` | Marketing site (Vite), optional |
| `docker-compose.yml` | Local **Valkey** (Redis-compatible) for `REDIS_URL` |

**Package manager:** use [pnpm](https://pnpm.io/) in each app folder (`pnpm install`).

---

## 1. Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm**
- **Docker Desktop** (for local Valkey)
- **PostgreSQL** — connection string in `backend/.env` as `POSTGRES_DATABASE_URL` (often Supabase or local Postgres)

---

## 2. Valkey (Redis) for backend + worker

From the **repo root**:

```bash
docker compose up -d valkey
```

Check:

```bash
docker ps
docker exec -it decory-valkey valkey-cli ping
```

Expect `PONG`.

In **`backend/.env`** (API and worker run on your machine, not inside Docker):

```env
REDIS_URL=redis://localhost:6379
```

Do **not** use `redis://valkey:6379` unless the Node process runs in the same Docker Compose network.

Restart API/worker after changing `REDIS_URL`.

---

## 3. Backend API

```bash
cd backend
pnpm install
cp .env.example .env   # if you don't have .env yet — then fill secrets
pnpm run db:migrate    # apply Drizzle migrations
pnpm run dev           # API on PORT from .env (default 3000)
```

- Base URL: `http://localhost:3000`
- API prefix: `/api/v1` (e.g. `http://localhost:3000/api/v1`)

Useful DB commands (from `backend/`):

| Command | Purpose |
|---------|---------|
| `pnpm run db:migrate` | Run migrations |
| `pnpm run db:generate` | Generate migration after schema changes |
| `pnpm run db:studio` | Drizzle Studio |
| `pnpm run db:seed:templates` | Seed notification templates |

Production-style:

```bash
pnpm run build
pnpm run start
```

---

## 4. Backend worker (required for queues)

Runs **BullMQ** workers: notifications (SMS/email/push), upload optimize, payment webhooks, assignment reminders, settlement sweep, etc. Uses the same `backend/.env` and **`REDIS_URL`**.

**Second terminal:**

```bash
cd backend
pnpm run worker:dev    # watch mode (recommended for dev)
```

Or without watch:

```bash
pnpm run worker
```

Run **API + worker + Valkey** together for full behavior (OTP, async notifications, image optimize, etc.).

---

## 5. Customer web (`app/web`)

```bash
cd app/web
pnpm install
pnpm run dev
```

- URL: **http://localhost:5174** (fixed in `vite.config.js`)
- Optional `.env`: `VITE_API_URL=http://localhost:3000/api/v1`, `VITE_GOOGLE_CLIENT_ID=...`

---

## 6. Admin panel (`app/admin`)

```bash
cd app/admin
pnpm install
cp .env.example .env   # optional; defaults point at local API
pnpm run dev
```

- URL: **http://localhost:5173** (Vite default)
- `.env`: `VITE_API_URL=http://localhost:3000/api/v1`, `VITE_WEB_URL=http://localhost:5174`

---

## 7. Vendor / partner app (`app/vendor`)

```bash
cd app/vendor
pnpm install
pnpm start
```

Set API URL for device/emulator (e.g. `.env` or `app/vendor/lib/env.ts`):

- Physical device / emulator cannot use `localhost` for your PC API — use your machine LAN IP or a tunnel (ngrok), e.g. `EXPO_PUBLIC_API_URL=http://<your-ip>:3000/api/v1`

Expo docs: [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/).

---

## 8. Website (`app/website`) — optional

```bash
cd app/website
pnpm install
pnpm run dev
```

---

## 9. Typical dev session (checklist)

Open **separate terminals**:

1. **Repo root:** `docker compose up -d valkey`
2. **`backend/`:** `pnpm run dev` (API)
3. **`backend/`:** `pnpm run worker:dev` (worker)
4. **`app/web/`:** `pnpm run dev` → http://localhost:5174
5. **`app/admin/`:** `pnpm run dev` → http://localhost:5173
6. **`app/vendor/`:** `pnpm start` (when working on mobile)

---

## 10. Common issues

| Problem | Fix |
|---------|-----|
| `no configuration file provided` for Docker | Run `docker compose` from repo root where `docker-compose.yml` lives |
| `ENOTFOUND valkey` | Use `REDIS_URL=redis://localhost:6379` when API runs on host |
| `Redis connection failed` | Start Valkey: `docker compose up -d valkey` |
| Custom admin booking FK on `product_id` | Do not set fake `ADMIN_CUSTOM_PRODUCT_ID`; run `pnpm run db:migrate` (creates slug `admin-custom-booking`) |
| Web cannot reach API | CORS/`WEB_APP_ORIGIN` in `backend/.env`; `VITE_API_URL` must match API |

---

## 11. Environment files (summary)

| App | File | Key variables |
|-----|------|----------------|
| Backend | `backend/.env` | `POSTGRES_DATABASE_URL`, `REDIS_URL`, `PORT`, `JWT_SECRET`, payment/SMS keys, `WEB_APP_ORIGIN` |
| Admin | `app/admin/.env` | `VITE_API_URL`, `VITE_WEB_URL` |
| Web | `app/web/.env` | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` |
| Vendor | Expo env / `lib/env.ts` | API base URL reachable from device |

Never commit real secrets; keep `.env` out of git.
