# CommunityFinder 🏠🍎🏥🚨

> A Digital Platform for Locating Essential Public Services

## Quick 

### 1. Start the Backend (Terminal 1)
```bash
cd server
npm install
node index.js
# Server runs on http://localhost:5000
```

### 2. Start the Frontend (Terminal 2)
```bash
cd client
npm install --legacy-peer-deps
npm run dev
# App runs on http://localhost:3000
```

## Pages

| Route | Page |
|-------|------|
| `/` | Landing Page |
| `/search` | Search Results (with filters) |
| `/resource/:id` | Resource Details |
| `/admin` | Admin Dashboard |
| `/login` | Login |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | List all (supports `?category=`, `?search=`, `?availability=`, `?maxDistance=`) |
| GET | `/api/resources/:id` | Get single resource |
| POST | `/api/resources` | Create resource |
| PUT | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Delete resource |
| GET | `/api/resources/stats` | Dashboard stats |

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS v4, Framer Motion, React Icons
- **Backend**: Node.js + Express (mock in-memory data)
