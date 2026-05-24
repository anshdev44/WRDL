# WRDL

WRDL is a real-time, multiplayer word-guessing game built on Next.js, Socket.io, MongoDB, and the Google Gemini AI platform. Players join synced game lobbies, compete to identify a hidden word as letters are progressively revealed, and leverage AI-generated clues to gain a competitive advantage.

---

## Key Features

1. **Real-Time Multiplayer Synchronicity**: Utilizing Socket.io to manage and propagate game state changes, live chat messages, and clock synchronization across all active players in a room.
2. **Dynamic Placement Scoring**: Points are distributed according to guess speed and accuracy. The first player to guess correctly receives 20 points, with subsequent guessers obtaining 15, 10, and 5 points. Incorrect guesses deduct 10 points.
3. **AI Clue Engine (Gemini 2.5 Flash)**:
   * **Public General Clues**: The engine automatically provides a vague, creative clue in the public chat area every 30 seconds.
   * **Private Specialized Clues**: Players can spend 10 points to request a highly specific, targeted clue delivered exclusively to their own interface.
4. **Host Orchestration**: Rooms are managed by their creators (hosts), who possess administrative control to initialize game rounds when players are ready.
5. **Incremental Character Reveal**: Words are progressively exposed letter-by-letter over a two-minute round duration, calibrated based on the target word's length.
6. **Persistent Database Integration**: Words are dynamically fetched from a MongoDB cluster, supporting dictionary scaling and room lifecycle persistence.

---

## Technical Architecture

* **Frontend Client**: Next.js (App Router), React, Tailwind CSS, Framer Motion, and GSAP.
* **Backend Server**: Node.js, Express, Socket.io.
* **Database Layer**: MongoDB via Mongoose ODM.
* **Artificial Intelligence**: Google Generative AI Node.js SDK (@google/generative-ai).
* **Authentication**: NextAuth.js (supporting Google and GitHub OAuth providers).

---

## Project Directory Layout

```
.
├── app/                  # Next.js frontend pages, API routes, and components
│   ├── action/           # Server Actions executing database transactions
│   ├── api/              # Route handlers (NextAuth, room management, random word fetch)
│   ├── components/       # Shared UI modules (Navigation, Game Rules overlay)
│   ├── db/               # MongoDB client instantiation and connection utility
│   ├── game/[roomID]/    # Client-side dynamic route for real-time game lobby and arena
│   └── models/           # Mongoose schemas (User, Room, Word)
├── backend/              # Node.js Socket.io real-time coordination server
└── public/               # Static assets, icons, and logo assets
```

---

## Installation and Configuration

### 1. Prerequisites
Ensure the following packages are installed on your host system:
* Node.js (version 18.0.0 or higher)
* A running MongoDB instance (or MongoDB Atlas Cloud cluster)
* A valid Google Gemini API Key
* OAuth Credentials for Google and GitHub (obtained via the respective developer consoles)

### 2. Environment Variables Configuration
Configure a `.env` file in the root workspace directory. You can copy the template provided in `.env.example`:

```bash
cp .env.example .env
```

Ensure the following variables are defined:

```env
# Database Credentials
MONGODB_URI=your_mongodb_connection_string

# NextAuth Authentication Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_cryptographic_nextauth_secret

# OAuth Client Credentials
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Platform Keys
GEMINI_API_KEY=your_google_gemini_api_key

# Network and Deployment Configuration
PORT=4000
APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 3. Dependency Installation
Initialize packages for both the Next.js frontend application and the Express/Socket.io backend server:

```bash
# Install root (Next.js frontend) packages
npm install

# Install socket server packages
cd backend
npm install
cd ..
```

---

## Local Development Execution

To test the application locally, start both the Next.js frontend and the Socket.io backend concurrently.

### Command Terminal 1 (Next.js Frontend)
From the root workspace directory:
```bash
npm run dev
```
The client-side interface will run at `http://localhost:3000`.

### Command Terminal 2 (Socket.io Backend)
From the root workspace directory:
```bash
cd backend
node server.js
```
The socket server will bind to the port defined in your environment configurations (default: `4000`).

---

## Database Initialization (Seeding)
To play the game, the Mongoose `Word` collection must contain guessable words. You can add entries to the database via standard MongoDB tools or custom scripts. 

Ensure the records conform to the Mongoose schema structure:
* `word` (String, required, unique, lowercase, trimmed)
* `length` (Number, required)
* `category` (String, default: "general")

---

