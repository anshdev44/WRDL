import { createServer } from "http";
import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const aiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

if (!aiModel) console.warn("️ Gemini AI is disabled. GEMINI_API_KEY not found in ../.env");

httpServer.listen(4000, () => console.log(" Server listening on port 4000"));

const roomChats         = new Map(); 
const roomWord          = new Map(); 
const roomstarted       = new Map(); 
const roomTimerIntervals= new Map(); 
const roomRevealIntervals=new Map(); 
const roomGeneralHintIntervals=new Map(); 
const roomRevealedIdx   = new Map(); 
const roomGuessOrder    = new Map(); 
const roomHosts         = new Map(); 
const socketMeta        = new Map(); 

const MAX_HISTORY = 50;
const POINTS      = [20, 15, 10, 5]; 

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
    if (roomGeneralHintIntervals.has(roomID)) { clearInterval(roomGeneralHintIntervals.get(roomID)); roomGeneralHintIntervals.delete(roomID); }
    roomChats.delete(roomID);
    roomWord.delete(roomID);
    roomstarted.delete(roomID);
    roomRevealedIdx.delete(roomID);
    roomGuessOrder.delete(roomID);
    roomHosts.delete(roomID);
};

const startLetterReveal = (roomID, word) => {
    if (roomRevealIntervals.has(roomID)) { clearInterval(roomRevealIntervals.get(roomID)); }
    
    const intervalSec = Math.floor(120 / word.length); 
    roomRevealedIdx.set(roomID, new Set());

    const interval = setInterval(() => {
        const revealed = roomRevealedIdx.get(roomID);
        if (!revealed) return;

        const unrevealed = [];
        for (let i = 0; i < word.length - 1; i++) {
            if (!revealed.has(i)) unrevealed.push(i);
        }

        if (unrevealed.length === 0) {
          
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

const startTimer = (roomID, minutes, seconds) => {
    if (roomTimerIntervals.has(roomID)) clearInterval(roomTimerIntervals.get(roomID));

    const interval = setInterval(() => {
        if (!roomTimerIntervals.has(roomID)) return;

        if (seconds === 0) {
            if (minutes === 0) {
               
                clearInterval(interval);
                roomTimerIntervals.delete(roomID);

                if (roomRevealIntervals.has(roomID)) {
                    clearInterval(roomRevealIntervals.get(roomID));
                    roomRevealIntervals.delete(roomID);
                }
                if (roomGeneralHintIntervals.has(roomID)) {
                    clearInterval(roomGeneralHintIntervals.get(roomID));
                    roomGeneralHintIntervals.delete(roomID);
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

                const guessOrder = roomGuessOrder.get(roomID) || [];
                io.to(roomID).emit("timer-ended", { roomID, word, scores: guessOrder });

                pushChat(roomID, { from: " Round Over", msg: `The word was: "${word}"`, colour: "gold" });

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

io.on("connection", (socket) => {
    console.log(" Connected:", socket.id);

    socket.on("disconnect", () => {
        console.log(" Disconnected:", socket.id);
        socketMeta.delete(socket.id);
    });

    socket.on("create-room", (roomID, username, email) => {
        socket.join(roomID);
        roomHosts.set(roomID, socket.id);
        socketMeta.set(socket.id, { roomID, email, username });
        console.log(` ${username} created room ${roomID}`);
    });

    socket.on("join-room", (roomID, username, email) => {
        socket.join(roomID);
        socketMeta.set(socket.id, { roomID, email, username });
        io.to(roomID).emit("user_joined", { user: username, message: "has joined the room" });
        socket.emit("joined-room", { roomID, username, email });
        console.log(` ${username} joined socket room ${roomID}`);
    });

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

    socket.on("BUZZED", (payload) => {
        const roomID   = payload?.roomID;
        const username = payload?.username;
        const email    = payload?.email;
        if (!roomID) return;
        const hostSocketId = roomHosts.get(roomID);
        if (hostSocketId) {
            console.log(` ${username} buzzed host in room ${roomID}`);
            io.to(hostSocketId).emit("BUZZES", { id: socket.id, username, email });
        }
    });

    socket.on("start-game", (roomid, username) => {
        if (!roomid) return;
        roomstarted.set(roomid, true);
        roomGuessOrder.set(roomid, []);
        io.to(roomid).emit("game-started", { message: "Game is starting", startedBy: username || "Host" });
        console.log(` Game started in room ${roomid} by ${username}`);
    });

    socket.on("is-game-started", (roomid) => {
        if (roomstarted.get(roomid)) socket.emit("game-has-started");
    });

    socket.on("send-word", async (roomid) => {
        try {
            const res = await fetch("http://localhost:3000/api/word/random");
            const data = await res.json();
            
            const word = data.word || "pizza";

            roomWord.set(roomid, word);
            roomGuessOrder.set(roomid, []);
            io.to(roomid).emit("receive-word", word);
            startLetterReveal(roomid, word);
            console.log(` Word "${word}" sent to room ${roomid} (from DB)`);

            if (aiModel) {
                const sendGeneralHint = async () => {
                    if (!roomWord.has(roomid)) return;
                    try {
                        const prompt = `The word is "${word}". Provide a very short, fun, vague general hint for players guessing this word. It must be less than 15 words. Do NOT say the word itself or use any emojis. and please use simple language like what it is used for or what does it do not rhymes with or other things`;
                        const result = await aiModel.generateContent(prompt);
                        let hintText = result.response.text().trim();
                        hintText = hintText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
                        pushChat(roomid, { from: "wrdl-bot", msg: `Hint: ${hintText}`, colour: "cyan" });
                    } catch (e) {
                        console.error("Gemini general hint error", e);
                    }
                };

                sendGeneralHint();

                const hintInterval = setInterval(async () => {
                    if (!roomWord.has(roomid)) {
                        clearInterval(hintInterval);
                        return;
                    }
                    await sendGeneralHint();
                }, 30000);
                roomGeneralHintIntervals.set(roomid, hintInterval);
            }

        } catch (error) {
            console.error("Failed to fetch word from DB, using fallback:", error);
            const word = "apple";
            roomWord.set(roomid, word);
            roomGuessOrder.set(roomid, []);
            io.to(roomid).emit("receive-word", word);
            startLetterReveal(roomid, word);
        }
    });

    socket.on("start-timer", (roomid) => {
        if (roomTimerIntervals.has(roomid)) {
            clearInterval(roomTimerIntervals.get(roomid));
            roomTimerIntervals.delete(roomid);
        }
        const minutes = 2, seconds = 0;
        io.to(roomid).emit("timer-started", [{ minutes, seconds }]);
        startTimer(roomid, minutes, seconds);
    });

    socket.on("stop-timer", (roomid) => {
        if (roomTimerIntervals.has(roomid)) {
            clearInterval(roomTimerIntervals.get(roomid));
            roomTimerIntervals.delete(roomid);
        }
        if (roomRevealIntervals.has(roomid)) {
            clearInterval(roomRevealIntervals.get(roomid));
            roomRevealIntervals.delete(roomid);
        }
        if (roomGeneralHintIntervals.has(roomid)) {
            clearInterval(roomGeneralHintIntervals.get(roomid));
            roomGeneralHintIntervals.delete(roomid);
        }
        io.to(roomid).emit("stopped-timer", roomid);
    });

    socket.on("send-message", (data) => {
        const { message, roomID, username, colour } = data;
        if (!roomID || !message || !username) return;
        pushChat(roomID, { from: username, msg: message, colour: colour || "transparent" });
    });

    socket.on("send-messages-backend", (roomid) => {
        socket.emit("receive-message", roomChats.get(roomid) || []);
    });

    socket.on("correct-guess", (data) => {
        const { roomID, username, email } = data;

        const order = roomGuessOrder.get(roomID) || [];
       
        if (order.find(p => p.email === email)) return;

        const position = order.length;           
        const points   = POINTS[position] ?? 0;
        order.push({ username, email, points, position: position + 1 });
        roomGuessOrder.set(roomID, order);

        io.to(roomID).emit("player-guessed-correctly", {
            username, roomID, points, position: position + 1
        });

        pushChat(roomID, {
            from: " System",
            msg: `${username} guessed the word correctly! +${points} pts (Position #${position + 1})`,
            colour: "green",
        });

        console.log(` ${username} guessed correctly in room ${roomID} — Position #${position + 1}, ${points} pts`);

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
            if (roomGeneralHintIntervals.has(roomID)) {
                clearInterval(roomGeneralHintIntervals.get(roomID));
                roomGeneralHintIntervals.delete(roomID);
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
            pushChat(roomID, { from: " Round Over", msg: `Everyone guessed the word! The word was: "${word}"`, colour: "gold" });

            roomstarted.delete(roomID);
            roomWord.delete(roomID);
            roomRevealedIdx.delete(roomID);
            roomGuessOrder.delete(roomID);
            console.log(`⏰ Round ended early for room: ${roomID} because everyone guessed`);
        }
    });

    socket.on("wrong-guess", (data) => {
        const { roomID, username, colour, guess } = data;
        io.to(roomID).emit("player-guess-is-wrong", { username, roomID, guessedWord: guess, deduction: 10 });
        pushChat(roomID, { from: username, msg: `"${guess}" — wrong guess! (-10 pts)`, colour: colour || "red" });
    });

    socket.on("get-special-hint", async (data) => {
        const { roomID, email } = data;

        const order = roomGuessOrder.get(roomID) || [];
        if (order.find(p => p.email === email)) {
            socket.emit("receive-special-hint", { error: "You already guessed the word!" });
            return;
        }

        const word = roomWord.get(roomID);
        if (!word) {
            socket.emit("receive-special-hint", { error: "Game has not started or word not found." });
            return;
        }

        if (!aiModel) {
            socket.emit("receive-special-hint", { error: "AI hints are not configured on the server." });
            return;
        }

        try {
            const prompt = `The word is "${word}". Provide a close, specific hint for a player who paid points for it. Make it very helpful but do NOT say the actual word. Keep it under 15 words. Do NOT use any emojis.`;
            const result = await aiModel.generateContent(prompt);
            let hintText = result.response.text().trim();
           
            hintText = hintText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
            socket.emit("receive-special-hint", { hint: hintText });
        } catch (e) {
            console.error("Gemini special hint error", e);
            socket.emit("receive-special-hint", { error: "Failed to generate hint. Please try again." });
        }
    });
});
