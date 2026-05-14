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

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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

- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://render.com) — enable **WebSocket Support** in service settings

## 👥 Authors

- [Amir](https://github.com/jeeamir)
- [Malika](https://github.com/mill-del)