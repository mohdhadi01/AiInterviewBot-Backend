# AiInterviewBot Backend

Express.js + TypeScript + MongoDB backend for the AiInterviewBot app. Uses **ES modules** (`"type": "module"`) and is ready for Vercel deployment.

## Setup

```bash
cd AiInterviewBot-Backend
yarn install
cp .env.example .env
# Edit .env: set MONGODB_URI (see below)
```

## How to run the backend completely (with DB)

The backend needs **MongoDB** for users, sessions, and for tracks when you add custom ones. Choose one option below.

### Option A: MongoDB Atlas (cloud, free — no local install)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a **free cluster** (e.g. M0).
3. **Database Access** → Add Database User → create a user and password (save them).
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for dev (or add your IP).
5. **Database** → **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Replace `USER` and `PASSWORD` with your DB user and password. Add a database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/aiinterviewbot?retryWrites=true&w=majority`
7. In `AiInterviewBot-Backend`, create `.env` (or edit it):
   ```
   PORT=4000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/aiinterviewbot?retryWrites=true&w=majority
   ```
8. Run the backend:
   ```bash
   yarn dev
   ```
9. Open [http://localhost:4000/health](http://localhost:4000/health) — you should see `{"ok":true,"timestamp":"..."}`.
10. Try [http://localhost:4000/api/tracks](http://localhost:4000/api/tracks) — you get the default tracks (DB can be empty).

### Option B: Local MongoDB (Docker or installed)

**With Docker:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Or install MongoDB Community** from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community), then start the service (e.g. `mongod` on Mac/Linux, or MongoDB as a Windows service).

Then in `AiInterviewBot-Backend`:

1. Create `.env`:
   ```
   PORT=4000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/aiinterviewbot
   ```
2. Run:
   ```bash
   yarn dev
   ```
3. Test: [http://localhost:4000/health](http://localhost:4000/health) and [http://localhost:4000/api/tracks](http://localhost:4000/api/tracks).

### Quick test (after backend is running)

```bash
# Health
curl http://localhost:4000/health

# Tracks (default list if DB has no tracks)
curl http://localhost:4000/api/tracks

# Focus options
curl http://localhost:4000/api/focus

# Create a user (replace YOUR_FIREBASE_UID with any string for testing)
curl -X POST http://localhost:4000/api/users/YOUR_FIREBASE_UID -H "Content-Type: application/json" -d "{\"displayName\":\"Test User\",\"primaryFocus\":\"Frontend\"}"

# Get user
curl http://localhost:4000/api/users/YOUR_FIREBASE_UID

# Preferred tracks for that user
curl http://localhost:4000/api/users/YOUR_FIREBASE_UID/preferred-tracks
```

---

## Scripts

- `yarn dev` — run with hot reload (tsx)
- `yarn build` — compile TypeScript to `dist/`
- `yarn start` — run compiled app (after `yarn build`)

## API at a glance (10 endpoints)

| # | Method | Endpoint | Data |
|---|--------|----------|------|
| 1 | GET | `/api/tracks` | List of all tracks (each has `focusAreas?` for sub-topics) |
| 2 | GET | `/api/focus` | Focus options for onboarding / change focus |
| 2b | GET | `/api/focus/domains-map` | Focus → domains: which domains belong to each focus |
| 3 | GET | `/api/users/:userId` | One user (profile + primaryFocus) |
| 4 | GET | `/api/users/:userId/preferred-tracks` | 4 tracks for home |
| 5 | GET | `/api/users/:userId/sessions` | **Interview history** (HistorySession[]) |
| 6 | POST | `/api/users/:userId/sessions` | Add one session (when user ends interview) |
| 7 | DELETE | `/api/users/:userId/sessions` | Clear all sessions |
| 8 | DELETE | `/api/users/:userId/sessions/:sessionId` | Remove one session |
| 9 | POST | `/api/users/:userId` | Create/update user |
| 10 | GET | `/health` | `{ ok: true, timestamp }` |

**History flow:** When user ends an interview → **POST** `/api/users/:userId/sessions` with `{ domain, trackId?, difficulty, focusTopic?, durationSeconds? }`. History screen → **GET** `/api/users/:userId/sessions` → show list (group by date, stats).

---

## Endpoints & data (detail)

| Endpoint | Method | What you get |
|----------|--------|----------------|
| `/api/tracks` | GET | All tracks (TrackItem[]) |
| `/api/focus` | GET | Focus options for onboarding / change focus (FocusItemDTO[]) |
| `/api/focus/domains-map` | GET | **Focus → domains:** `{ [focusId]: domain[] }` (which domains belong to each focus) |
| `/api/users/:userId` | GET | One **UserProfile** (includes `primaryFocus`) |
| `/api/users/:userId/preferred-tracks` | GET | 4 TrackItem for home |
| `/api/users/:userId/sessions` | GET | Interview history (HistorySession[]), optional `?limit=100` |
| `/api/users/:userId/sessions` | POST | Add session (body: `domain`, `difficulty`, `trackId?`, `focusTopic?`, `durationSeconds?`) |
| `/api/users/:userId/sessions` | DELETE | Clear all sessions for user |
| `/api/users/:userId/sessions/:sessionId` | DELETE | Remove one session |
| `/api/users/:userId` | POST | Create/update user |
| `/health` | GET | `{ ok, timestamp }` |

### Focus (onboarding / change focus)

- **GET `/api/focus`** — list of career focus options `{ id, label, desc, iconId }[]` (same as frontend FOCUS_DATA; app maps `iconId` to Lucide icon).
- **GET `/api/focus/domains-map`** — which **domains** (track.domain) belong to each focus. Returns `{ [focusId]: string[] }`, e.g. `{ "Frontend": ["Frontend"], "Mobile": ["Android", "iOS"], ... }`. Use for filtering or “tracks for this focus” UI.

### Tracks (TrackItem)

- **Stored in:** MongoDB collection from `Track` model (id, title, subtitle, image, domain, order, active, **focusAreas**).
- **Returned by:** **GET `/api/tracks`** and **GET `/api/users/:userId/preferred-tracks`** as `{ success: true, data: TrackItem[] }`.
- **Shape:** `{ id, title, subtitle, image, domain, focusAreas? }`. **focusAreas** = sub-topics/focus areas for this track (e.g. React: `["Hooks", "Components", "Performance", "State management", "Testing"]`). Use for focus-topic picker when starting an interview. If DB has no track docs, a default list with focusAreas is returned.

### User (UserProfile)

- **Stored in:** MongoDB collection from `User` model (firebaseUid, email, displayName, avatarUri, photoURL, phoneNumber, **primaryFocus**).
- **Returned by:** **GET `/api/users/:userId`** and **POST `/api/users/:userId`** as `{ success: true, data: UserProfile }`.
- **Shape:** `{ id, email?, displayName, avatarUri?, photoURL?, phoneNumber?, primaryFocus?, createdAt?, updatedAt? }` (id = firebaseUid).
- **POST** body can include `primaryFocus` (e.g. `"Frontend"`, `"Backend"`) — saved when user chooses field on onboarding or change focus screen.

### Preferred tracks (4 cards on home)

- **GET `/api/users/:userId/preferred-tracks`** — returns 4 **TrackItem** based on user's `primaryFocus` (same logic as frontend: FOCUS_TO_DOMAINS + tech/non-tech fill). If user has no focus, returns first 4 tracks.

### Sessions (interview history)

- **Shape:** `{ id, domain, trackId?, difficulty, focusTopic, completedAt, durationSeconds? }` — matches frontend **HistorySession** (historySlice).
- **GET `/api/users/:userId/sessions`** — list sessions for user, newest first. Optional query `?limit=100` (default 100, max 100).
- **POST `/api/users/:userId/sessions`** — add one session when user ends an interview. Body: `domain` (required), `difficulty` (required, `"Junior"` \| `"Mid"` \| `"Senior"`), `trackId?`, `focusTopic?`, `durationSeconds?`. Server sets `completedAt`. Returns created session. Keeps last 100 sessions per user.
- **DELETE `/api/users/:userId/sessions`** — clear all sessions for user.
- **DELETE `/api/users/:userId/sessions/:sessionId`** — remove one session (e.g. swipe to delete).

## Project structure (MVC)

```
src/
  config.ts       env + MongoDB connect
  models/         User, Track, Focus, Session (Mongoose + helpers)
  controllers/    user.controller, track.controller, focus.controller
  routes/         user.routes, track.routes, focus.routes
  app.ts          Express (cors, json, routes, 404, error)
  server.ts       local entry
api/
  index.ts        Vercel serverless entry
```

## Vercel

1. Set env vars in Vercel: `MONGODB_URI`, optionally `PORT`.
2. Build runs `yarn build`; the serverless function is `api/index.ts`, which exports the Express app.
3. `vercel.json` rewrites `/api/*` and `/health` to the single serverless handler so Express routes work as above.

## Local MongoDB

If you use a local MongoDB:

```bash
# macOS/Linux
mongod

# Or with Docker
docker run -p 27017:27017 mongo:latest
```

Then `MONGODB_URI=mongodb://localhost:27017/aiinterviewbot` in `.env`.
