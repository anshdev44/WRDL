import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

httpServer.listen(4000, () => console.log("✅ Server listening on port 4000"));

// ─── State Maps ───────────────────────────────────────────────────────────────
const roomChats         = new Map(); // roomID -> [{from, msg, colour}]
const roomWord          = new Map(); // roomID -> word string
const roomstarted       = new Map(); // roomID -> bool
const roomTimerIntervals= new Map(); // roomID -> setInterval ID
const roomRevealIntervals=new Map(); // roomID -> setInterval ID  (letter reveal)
const roomRevealedIdx   = new Map(); // roomID -> Set of revealed indices
const roomGuessOrder    = new Map(); // roomID -> [{username, email, points, position}]
const roomHosts         = new Map(); // roomID -> host socket.id
const socketMeta        = new Map(); // socket.id -> {roomID, email, username}

const MAX_HISTORY = 50;
const POINTS      = [20, 15, 10, 5]; // by position

const wordList = [
  "apple","beach","brain","bread","brush","chair","chest","chord","click","clock",
  "cloud","dance","diary","drink","drive","earth","feast","field","fruit","glass",
  "grape","green","ghost","guide","heart","house","human","juice","light","lemon",
  "melon","money","music","night","ocean","party","piano","pilot","plane","plant",
  "plate","phone","power","quiet","radio","river","robot","scene","scope","score",
  "shape","share","shirt","smile","snake","space","spoon","stone","storm","sugar",
  "table","taste","tiger","toast","touch","tower","track","trade","train","truck",
  "uncle","unity","value","video","virus","voice","waste","watch","water","whale",
  "white","woman","world","write","youth","zebra",
];

const pickWord = () => wordList[Math.floor(Math.random() * wordList.length)];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pushChat = (roomID, entry) => {
    if (!roomChats.has(roomID)) roomChats.set(roomID, []);
    const arr = roomChats.get(roomID);
    arr.push(entry);
    if (arr.length > MAX_HISTORY) arr.shift();
    io.to(roomID).emit("receive-message", arr);
};

const cleanupRoom = (roomID) => {
    if (roomTimerIntervals.has(roomID)) { clearInterval(roomTimerIntervals.get(roomID)); roomTimerIntervals.delete(roomID); }
    if (roomRevealIntervals.has(roomID)) { clearInterval(roomRevealIntervals.get(roomID)); roomRevealIntervals.delete(roomID); }
    roomChats.delete(roomID);
    roomWord.delete(roomID);
    roomstarted.delete(roomID);
    roomRevealedIdx.delete(roomID);
    roomGuessOrder.delete(roomID);
    roomHosts.delete(roomID);
};

// ─── Letter Reveal Schedule ───────────────────────────────────────────────────
// Interval = floor(120 / wordLength) seconds. Last letter never revealed until timer ends.
const startLetterReveal = (roomID, word) => {
    if (roomRevealIntervals.has(roomID)) { clearInterval(roomRevealIntervals.get(roomID)); }
    
    const intervalSec = Math.floor(120 / word.length); // e.g. 5-letter word → 24s
    roomRevealedIdx.set(roomID, new Set());

    const interval = setInterval(() => {
        const revealed = roomRevealedIdx.get(roomID);
        if (!revealed) return;

        // Collect unrevealed indices EXCLUDING the last letter
        const unrevealed = [];
        for (let i = 0; i < word.length - 1; i++) {
            if (!revealed.has(i)) unrevealed.push(i);
        }

        if (unrevealed.length === 0) {
            // All non-last letters already revealed — stop
            clearInterval(interval);
            roomRevealIntervals.delete(roomID);
            return;
        }

        const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        revealed.add(idx);
        io.to(roomID).emit("reveal-letter", { index: idx, letter: word[idx] });
        console.log(`Revealed letter [${idx}]='${word[idx]}' in room ${roomID}`);
    }, intervalSec * 1000);

    roomRevealIntervals.set(roomID, interval);
};

// ─── Timer ────────────────────────────────────────────────────────────────────
const startTimer = (roomID, minutes, seconds) => {
    if (roomTimerIntervals.has(roomID)) clearInterval(roomTimerIntervals.get(roomID));

    const interval = setInterval(() => {
        if (!roomTimerIntervals.has(roomID)) return;

        if (seconds === 0) {
            if (minutes === 0) {
                // ── Time's up ──
                clearInterval(interval);
                roomTimerIntervals.delete(roomID);

                // Stop letter reveal
                if (roomRevealIntervals.has(roomID)) {
                    clearInterval(roomRevealIntervals.get(roomID));
                    roomRevealIntervals.delete(roomID);
                }

                // Reveal remaining letters (including the last one)
                const word = roomWord.get(roomID) || "";
                const revealed = roomRevealedIdx.get(roomID) || new Set();
                const finalReveal = {};
                for (let i = 0; i < word.length; i++) {
                    if (!revealed.has(i)) finalReveal[i] = word[i];
                }
                if (Object.keys(finalReveal).length > 0) {
                    io.to(roomID).emit("reveal-remaining", finalReveal);
                }

                // Emit final scores
                const guessOrder = roomGuessOrder.get(roomID) || [];
                io.to(roomID).emit("timer-ended", { roomID, word, scores: guessOrder });

                pushChat(roomID, { from: "🏁 Round Over", msg: `The word was: "${word}"`, colour: "gold" });

                // Clean up game state but keep room alive for next round
                roomstarted.delete(roomID);
                roomWord.delete(roomID);
                roomRevealedIdx.delete(roomID);
                roomGuessOrder.delete(roomID);
                console.log(` Timer ended for room: ${roomID}`);
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }

        io.to(roomID).emit("timer-update", minutes, seconds);
    }, 1000);

    roomTimerIntervals.set(roomID, interval);
};

// ─── Socket Connections ───────────────────────────────────────────────────────
io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
        socketMeta.delete(socket.id);
    });

    // ── Create Room ──
    socket.on("create-room", (roomID, username, email) => {
        socket.join(roomID);
        roomHosts.set(roomID, socket.id);
        socketMeta.set(socket.id, { roomID, email, username });
        console.log(`✅ ${username} created room ${roomID}`);
    });

    // ── Join Room (socket-only, DB handled by frontend HTTP call) ──
    socket.on("join-room", (roomID, username, email) => {
        socket.join(roomID);
        socketMeta.set(socket.id, { roomID, email, username });
        io.to(roomID).emit("user_joined", { user: username, message: "has joined the room" });
        socket.emit("joined-room", { roomID, username, email });
        console.log(`✅ ${username} joined socket room ${roomID}`);
    });

    // ── Leave Room ──
    socket.on("leave-room", async (roomID, email) => {
        try {
            const res = await fetch("http://localhost:3000/api/room/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: roomID, email }),
            });
            const data = await res.json();

            if (res.status === 200) {
                socket.leave(roomID);
                socketMeta.delete(socket.id);
                if (data.message?.includes("empty room was deleted")) {
                    io.in(roomID).emit("room-deleted", { reason: "empty" });
                    io.in(roomID).socketsLeave(roomID);
                    cleanupRoom(roomID);
                } else {
                    io.to(roomID).emit("player-left", { email, message: data.message });
                }
            } else if (res.status === 201) {
                socket.leave(roomID);
                socketMeta.delete(socket.id);
                io.to(roomID).emit("room-deleted", { reason: "host-left" });
                io.in(roomID).socketsLeave(roomID);
                cleanupRoom(roomID);
            } else {
                socket.emit("error-leaving-room", { error: data.error, roomID, email });
            }
        } catch (err) {
            console.error("leave-room error:", err);
            socket.emit("error-leaving-room", { error: "Server error", roomID, email });
        }
    });

    // ── Buzz Host ──
    socket.on("BUZZED", (payload) => {
        const roomID   = payload?.roomID;
        const username = payload?.username;
        const email    = payload?.email;
        if (!roomID) return;
        const hostSocketId = roomHosts.get(roomID);
        if (hostSocketId) {
            console.log(`🔔 ${username} buzzed host in room ${roomID}`);
            io.to(hostSocketId).emit("BUZZES", { id: socket.id, username, email });
        }
    });

    // ── Start Game ──
    socket.on("start-game", (roomid, username) => {
        if (!roomid) return;
        roomstarted.set(roomid, true);
        roomGuessOrder.set(roomid, []);
        io.to(roomid).emit("game-started", { message: "Game is starting", startedBy: username || "Host" });
        console.log(`🎮 Game started in room ${roomid} by ${username}`);
    });

    socket.on("is-game-started", (roomid) => {
        if (roomstarted.get(roomid)) socket.emit("game-has-started");
    });

    // ── Send Word + start letter reveal ──
    socket.on("send-word", (roomid) => {
        const word = pickWord();
        roomWord.set(roomid, word);
        roomGuessOrder.set(roomid, []);
        io.to(roomid).emit("receive-word", word);
        startLetterReveal(roomid, word);
        console.log(`📝 Word "${word}" sent to room ${roomid}`);
    });

    // ── Start Timer ──
    socket.on("start-timer", (roomid) => {
        if (roomTimerIntervals.has(roomid)) {
            clearInterval(roomTimerIntervals.get(roomid));
            roomTimerIntervals.delete(roomid);
        }
        const minutes = 2, seconds = 0;
        io.to(roomid).emit("timer-started", [{ minutes, seconds }]);
        startTimer(roomid, minutes, seconds);
    });

    // ── Stop Timer (someone guessed correctly — host stops it) ──
    socket.on("stop-timer", (roomid) => {
        if (roomTimerIntervals.has(roomid)) {
            clearInterval(roomTimerIntervals.get(roomid));
            roomTimerIntervals.delete(roomid);
        }
        if (roomRevealIntervals.has(roomid)) {
            clearInterval(roomRevealIntervals.get(roomid));
            roomRevealIntervals.delete(roomid);
        }
        io.to(roomid).emit("stopped-timer", roomid);
    });

    // ── Chat ──
    socket.on("send-message", (data) => {
        const { message, roomID, username, colour } = data;
        if (!roomID || !message || !username) return;
        pushChat(roomID, { from: username, msg: message, colour: colour || "transparent" });
    });

    socket.on("send-messages-backend", (roomid) => {
        socket.emit("receive-message", roomChats.get(roomid) || []);
    });

    // ── Correct Guess ──
    socket.on("correct-guess", (data) => {
        const { roomID, username, email } = data;

        const order = roomGuessOrder.get(roomID) || [];
        // Prevent double-counting the same player
        if (order.find(p => p.email === email)) return;

        const position = order.length;            // 0-based
        const points   = POINTS[position] ?? 0;
        order.push({ username, email, points, position: position + 1 });
        roomGuessOrder.set(roomID, order);

        io.to(roomID).emit("player-guessed-correctly", {
            username, roomID, points, position: position + 1
        });

        pushChat(roomID, {
            from: "🎉 System",
            msg: `${username} guessed the word correctly! +${points} pts (Position #${position + 1})`,
            colour: "green",
        });

        console.log(`✅ ${username} guessed correctly in room ${roomID} — Position #${position + 1}, ${points} pts`);

        // Check if everyone has guessed the word
        const roomSize = io.sockets.adapter.rooms.get(roomID)?.size || 0;
        if (order.length >= roomSize && roomSize > 0) {
            if (roomTimerIntervals.has(roomID)) {
                clearInterval(roomTimerIntervals.get(roomID));
                roomTimerIntervals.delete(roomID);
            }
            if (roomRevealIntervals.has(roomID)) {
                clearInterval(roomRevealIntervals.get(roomID));
                roomRevealIntervals.delete(roomID);
            }

            const word = roomWord.get(roomID) || "";
            const revealed = roomRevealedIdx.get(roomID) || new Set();
            const finalReveal = {};
            for (let i = 0; i < word.length; i++) {
                if (!revealed.has(i)) finalReveal[i] = word[i];
            }
            if (Object.keys(finalReveal).length > 0) {
                io.to(roomID).emit("reveal-remaining", finalReveal);
            }

            io.to(roomID).emit("timer-ended", { roomID, word, scores: order });
            pushChat(roomID, { from: "🏁 Round Over", msg: `Everyone guessed the word! The word was: "${word}"`, colour: "gold" });

            roomstarted.delete(roomID);
            roomWord.delete(roomID);
            roomRevealedIdx.delete(roomID);
            roomGuessOrder.delete(roomID);
            console.log(`⏰ Round ended early for room: ${roomID} because everyone guessed`);
        }
    });

    // ── Wrong Guess ──
    socket.on("wrong-guess", (data) => {
        const { roomID, username, colour, guess } = data;
        io.to(roomID).emit("player-guess-is-wrong", { username, roomID, guessedWord: guess });
        pushChat(roomID, { from: username, msg: `"${guess}" — wrong guess!`, colour: colour || "red" });
    });
});
