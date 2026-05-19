# 🎬 CineClub — for film lovers

A full-stack social platform for cinephiles. Discover films, join clubs, vote for the film of the week, and chat with fellow film lovers in real time.

## ✨ Features

- 🎥 **Film catalog** — browse, search, and filter films by genre
- ⭐ **Reviews** — write and rate films (1–10)
- 🗳️ **Weekly vote** — nominate and vote for film of the week, live results via WebSocket
- 🎭 **Clubs** — create and join cinema clubs with cover images and pinned films
- 💬 **Live chat** — real-time chat inside each club (WebSocket)
- 📢 **Discussions** — persistent posts inside clubs, live updates via WebSocket
- 👤 **User profiles** — watchlist, watched, favorites, avatar upload
- 🟢 **Online presence** — see who's currently in a club in real time

## 🛠 Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication (bcrypt)
- WebSocket (`ws` library)
- UploadThing (file uploads)

**Frontend**
- Next.js 14 (App Router)
- Plain CSS
- React Hooks

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/mill-del/cineverse.git
cd cineverse
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=8080
JWT_SECRET=your_jwt_secret
UPLOADTHING_TOKEN=your_uploadthing_token
TMDB_API_KEY=your_tmdb_api_key
```

Start the backend:

```bash
node server.js
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `/frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the frontend (local):

```bash
npm run dev
```

Open https://cineverse-gx6v.onrender.com

## 📁 Project Structure

```
cineverse/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, UploadThing config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routers
│   │   ├── utils/          # Helper functions
│   │   └── websocket/      # WebSocket server
│   └── server.js
└── frontend/
    └── app/
        ├── components/     # Now just navbar
        ├── clubs/          # Club pages
        ├── movies/         # Movie pages
        ├── profile/        # User profile
        ├── vote/           # Weekly voting
        ├── utils/          
        ├── login/
        └── register/
```

## 🗄 Data Models

| Model | Description |
|-------|-------------|
| `User` | Auth, profile, watchlist, favorites |
| `Movie` | Film catalog with genres, cast, ratings |
| `Club` | Cinema clubs with members, pinned films |
| `Review` | Film reviews with score and text |
| `Vote` | Weekly film voting (one vote per user per week) |
| `Post` | Club discussion posts |

## 🌐 Deployment

- **Frontend**: [cineverse-mu-khaki.vercel.app]
- **Backend**: [https://cineverse-gx6v.onrender.com]

## 🧪 Testing

### Backend — Jest + Supertest

**Framework:** Jest  
**Integration testing:** Supertest  
**Total test cases:** 10

#### Unit Tests

**1. User Model Validation** — `tests/unit/User.model.test.js`

| # | Test | Expected |
|---|------|----------|
| 1 | Should fail without username | ValidationError thrown |
| 2 | Should fail without email | ValidationError thrown |
| 3 | Should create user successfully | User saved, `_id` defined |

**2. getCurrentWeek Utility** — `tests/unit/getCurrentWeek.test.js`

| # | Test | Expected |
|---|------|----------|
| 4 | Should return a number | `typeof result === 'number'` |
| 5 | Should return week between 1 and 53 | `1 ≤ result ≤ 53` |

**3. Auth Controller (Mocked)** — `tests/unit/auth.controller.test.js`

| # | Test | Expected |
|---|------|----------|
| 6 | Should return 400 if user already exists | `res.status(400)` |
| 7 | Should return 400 if password is wrong | `res.status(400)` |

> `User.findOne` and `bcrypt.compare` are mocked with `jest.fn()` — no real database calls.

#### Integration Tests

**4. Auth API** — `tests/integration/auth.test.js`

| # | Test | Expected |
|---|------|----------|
| 8 | POST /api/auth/register | Status 201, `token` in response |
| 9 | POST /api/auth/login | Status 200, `token` in response |

**5. Movies API** — `tests/integration/movies.test.js`

| # | Test | Expected |
|---|------|----------|
| 10 | GET /api/movies | Status 200, response is Array |

```bash
# Run all backend tests
cd backend
npx jest --runInBand

# Run only unit tests
npx jest tests/unit

# Run only integration tests
npx jest tests/integration
```

---

### Frontend — Jest + React Testing Library

**Total test cases:** 15

#### MoviePage — `__tests__/MoviePage.test.jsx`

| # | Test | Expected |
|---|------|----------|
| 1 | Shows Loading... while fetching | Loading state visible |
| 2 | Renders movie title and year | Title and year in DOM |
| 3 | Renders poster with correct alt text | `src` matches poster URL |
| 4 | Displays director and rating | Both visible in DOM |
| 5 | Displays genres as tags | Genre tags rendered |
| 6 | Write a review button toggles the review form | Form shows/hides |
| 7 | Watched button redirects to /login when not authenticated | `window.location.href === '/login'` |
| 8 | Shows "Movie not found" when fetch returns null | Fallback text visible |
| 9 | Review form submits POST and adds review to the list | New review appears in DOM |
| 10 | Cast members are displayed separated by commas | Cast string rendered |

#### ProfilePage — `__tests__/ProfilePage.test.jsx`

| # | Test | Expected |
|---|------|----------|
| 11 | Shows Loading... before user data is fetched | Loading state visible |
| 12 | Renders username and bio after loading | Both visible in DOM |
| 13 | Redirects to /login if no token | `window.location.href === '/login'` |
| 14 | Switching to watchlist tab shows empty state | Empty state message visible |
| 15 | Logout clears token and redirects to / | Token removed, redirect to `/` |

```bash
# Run all frontend tests
cd frontend
npx jest
```

## 👥 Authors

- [Amir](https://github.com/jeeamir)
- [Malika](https://github.com/mill-del)