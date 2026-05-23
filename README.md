# WRDL 

A real-time, multiplayer word-guessing game built with **Next.js**, **Socket.io**, **MongoDB**, and **Google Gemini AI**. Players join rooms, compete to guess a hidden word as its letters are progressively revealed, and can utilize AI-generated hints to gain an edge.

##  Features

- **Real-Time Multiplayer:** Instant socket-based synchronization for game state, live chats, and timer syncing.
- **Dynamic Scoring System:** First to guess gets 20 pts, subsequent guessers get 15, 10, and 5 pts. Incorrect guesses incur a -10 point penalty.
- **AI-Powered Hints (Gemini 2.5 Flash):**
  - **General Hints:** The AI automatically drops a fun, vague hint in the public chat box every 30 seconds.
  - **Specialized Hints:** Players can spend 10 points to get a highly specific, private hint delivered directly to their chatbox.
- **Host Controls:** Only the room host can start rounds, advancing the game when everyone is ready.
- **Progressive Letter Reveal:** Letters are automatically revealed one-by-one over a 2-minute timer depending on the length of the word.
- **Database Driven:** Words are fetched randomly from a MongoDB collection, making it easy to scale or categorize the dictionary.

##  Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Node.js, Socket.io, Express
- **Database:** MongoDB, Mongoose
- **AI Integration:** `@google/generative-ai` (Gemini API)

##  Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A MongoDB cluster (or local instance)
- A Google Gemini API Key

### 2. Environment Variables
Create a `.env` file in the root directory and add the following keys:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Installation

Install dependencies for both the frontend (root) and the backend:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 4. Running the Application

You will need to run both the Next.js server and the Socket.io backend server simultaneously.

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
node server.js
```

### 5. Seeding the Database
Before playing your first game, you need to populate the database with words. 
You need to manually add words to the database in future we will be adding a feature where 
the words are genrated randomly

##  How to Play

1. Log in using Google or GitHub.
2. Create a new room or join an existing one using a Room ID.
3. Once players are in, the Host clicks **Start Game**.
4. Type your guesses into the chatbox. Correct guesses lock your chat and award points based on your placement. Wrong guesses cost 10 points.
5. Stuck? Use the **Specialized Hint** button to spend 10 points for a private AI clue!
