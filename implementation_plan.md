# Hyper-Local Food Rescue Platform — Implementation Plan

A full-stack platform connecting food donors (restaurants, cafes, hostels) with food receivers (students, NGOs, individuals) via geolocation-based real-time matching.

---

## User Review Required

> [!IMPORTANT]
> **API Keys**: Google Maps API and Firebase FCM require real API keys. For the initial build, the map will use **Leaflet.js + OpenStreetMap** (free, no key needed) and notifications will use **WebSockets** (in-browser). Stubs will be added for FCM and Google Maps so you can plug in keys later.

> [!IMPORTANT]
> **Workspace**: All files will be created under `c:\Users\shaur\OneDrive\Desktop\HLFR\`. The project root will have `backend/`, `frontend/`, and `docker-compose.yml`.

> [!WARNING]
> **Docker required**: The full stack (PostgreSQL + Redis + backend + frontend) uses Docker Compose. You need Docker Desktop installed and running to bring up the full stack. The backend can also be run standalone with a local PostgreSQL instance.

---

## Open Questions

> [!IMPORTANT]
> **Do you have Docker Desktop installed?** If not, I can provide instructions to run backend/frontend individually without containers.

> [!IMPORTANT]
> **Do you have Google Maps API / Firebase credentials?** The plan defaults to free alternatives (Leaflet + WebSockets), but I can wire up the real APIs if you have keys.

---

## Proposed Changes

### Phase 1 — Project Scaffolding

#### [NEW] `docker-compose.yml` (root)
Full Docker Compose with postgres:15, redis:7, backend, and frontend services.

#### [NEW] `backend/.env`
Environment variables for DB URL, Redis URL, JWT secret, etc. (placeholder values).

#### [NEW] `frontend/.env`
Vite environment variables for API base URL.

---

### Phase 2 — Backend (FastAPI)

#### [NEW] `backend/requirements.txt`
```
fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg, alembic,
pydantic[email], passlib[bcrypt], python-jose[cryptography], python-multipart,
redis, aioredis, apscheduler, slowapi, structlog, httpx, Pillow
```

#### [NEW] `backend/Dockerfile`

#### [NEW] `backend/app/config.py`
Pydantic Settings class reading from `.env`.

#### [NEW] `backend/app/database.py`
Async SQLAlchemy engine + session factory with connection pooling (min 5, max 20).

#### [NEW] `backend/app/models/user.py`
User model: id, email, hashed_password, role, name, phone, lat, lng, fcm_token, is_verified, timestamps.

#### [NEW] `backend/app/models/listing.py`
FoodListing model: id, donor_id (FK), food_type, food_category, quantity, quantity_unit, description, pickup_address, lat, lng, prepared_at, expires_at, status, image_url, timestamps.

#### [NEW] `backend/app/models/transaction.py`
Transaction model: id, listing_id (FK), receiver_id (FK), donor_id (FK), status, claimed_at, completed_at, feedback_rating, feedback_text, cancelled_at, cancel_reason.

#### [NEW] `backend/app/schemas/` (user, listing, transaction)
Pydantic v2 schemas for request/response validation.

#### [NEW] `backend/app/services/auth_service.py`
JWT creation/verification, bcrypt hashing, token blacklist via Redis.

#### [NEW] `backend/app/services/geo_service.py`
Haversine distance formula, radius filtering, proximity sorting.

#### [NEW] `backend/app/services/listing_service.py`
Business logic: create listing, expiry check, background expiry task (APScheduler every 5 min).

#### [NEW] `backend/app/services/notification_service.py`
WebSocket manager (broadcast to rooms), FCM stub for future integration.

#### [NEW] `backend/app/routers/auth.py`
`/api/auth` — register, login, refresh, logout, update-fcm-token, GET/PUT /me

#### [NEW] `backend/app/routers/listings.py`
`/api/listings` — full CRUD + `/nearby` geo-filtered endpoint + `/my` donor endpoint.

#### [NEW] `backend/app/routers/claims.py`
`/api/claims` — claim, cancel, complete, list. Uses `SELECT FOR UPDATE` to prevent race conditions.

#### [NEW] `backend/app/routers/notifications.py`
`/api/notifications` + WebSocket endpoint `/ws/{user_id}`.

#### [NEW] `backend/app/routers/geo.py`
`/api/geo` — reverse geocode endpoint (stub for Google Maps, defaults to coordinates).

#### [NEW] `backend/app/routers/admin.py`
`/api/admin` — users, listings, stats, transactions (admin-only).

#### [NEW] `backend/app/middleware/auth_middleware.py`
JWT Bearer middleware + role guard dependency functions.

#### [NEW] `backend/app/main.py`
FastAPI app, CORS, routers, APScheduler startup, WebSocket, rate limiting (slowapi), structlog.

---

### Phase 3 — Frontend (React + Vite + Tailwind)

#### [NEW] `frontend/package.json`
Dependencies: react, react-dom, react-router-dom v6, @tanstack/react-query, axios, leaflet, react-leaflet, recharts, lucide-react, date-fns, tailwindcss, autoprefixer, postcss.

#### [NEW] `frontend/vite.config.js`
Vite config with proxy to backend at localhost:8000.

#### [NEW] `frontend/tailwind.config.js`
Custom theme with food-rescue color palette (emerald green, amber, dark mode).

#### [NEW] `frontend/src/index.css`
Global styles, custom scrollbar, animations.

#### [NEW] `frontend/src/api/axiosInstance.js`
Axios instance with JWT Bearer interceptor, auto-refresh on 401, error handling.

#### [NEW] `frontend/src/api/auth.js` / `listings.js` / `claims.js`
Typed API call functions.

#### [NEW] `frontend/src/context/AuthContext.jsx`
Global auth state: user, role, token, login/logout actions.

#### [NEW] `frontend/src/context/NotificationContext.jsx`
WebSocket connection, in-app toast notifications.

#### [NEW] `frontend/src/components/common/`
- `Navbar.jsx` — responsive top nav with role-based links
- `Sidebar.jsx` — desktop sidebar
- `LoadingSpinner.jsx` — animated spinner
- `Toast.jsx` — notification toast stack
- `ProtectedRoute.jsx` — role-based route guard

#### [NEW] `frontend/src/components/listings/`
- `ListingCard.jsx` — card with countdown timer (color-coded), distance badge, claim button
- `ListingGrid.jsx` — responsive grid
- `ListingDetail.jsx` — modal with full details + map pin
- `AddListingForm.jsx` — multi-step donor form

#### [NEW] `frontend/src/components/map/MapView.jsx`
Leaflet.js interactive map, clustered markers, popup with claim button, toggle map/list.

#### [NEW] `frontend/src/components/admin/`
- `AdminStats.jsx` — Recharts bar/pie charts
- `UserTable.jsx` — searchable/filterable table

#### [NEW] `frontend/src/pages/`
- `Home.jsx` — hero, stats, how-it-works section
- `Login.jsx` / `Register.jsx` — auth forms
- `Dashboard.jsx` — role-based dashboard
- `BrowseFood.jsx` — map + sidebar + filters
- `AddListing.jsx` — donor form page
- `MyListings.jsx` — donor listing management
- `MyClaims.jsx` — receiver claim history + rating
- `Profile.jsx` — edit profile + location
- `AdminPanel.jsx` — admin dashboard

#### [NEW] `frontend/src/hooks/`
- `useAuth.js`
- `useGeolocation.js` — `navigator.geolocation` with fallback
- `useListings.js` — React Query hooks

#### [NEW] `frontend/src/utils/formatters.js` / `validators.js`

#### [NEW] `frontend/Dockerfile`

---

## Verification Plan

### Automated
- `docker compose up --build` → all 4 services start healthy
- `curl http://localhost:8000/docs` → FastAPI OpenAPI docs render
- `curl http://localhost:3000` → React app loads

### End-to-End Manual Flow
1. Register as **Donor** → Login → Create food listing with lat/lng + expiry
2. Register as **Receiver** → Login → Open Browse Food → grant geolocation → see listing on map within 5 km
3. Claim listing → donor's listing status updates to "claimed" in real time (WebSocket)
4. Donor marks pickup complete → receiver can rate the transaction
5. Wait for expiry OR PATCH expire endpoint → listing disappears from browse view
6. Login as **Admin** → view all users/listings → deactivate a test user

### Browser Demo
- Run browser subagent to capture a recording of the full UI flow

---

## Implementation Order

1. Project scaffolding (docker-compose, .env files)
2. Backend: models → auth → listings → claims → geo → admin → websockets → background tasks
3. Frontend: scaffold → auth pages → dashboard → browse food (map) → add listing → my listings/claims → admin panel
4. Docker build validation
5. Browser demo recording
