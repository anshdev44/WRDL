"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import Nav from "@/app/components/nav";
import { useSession } from "next-auth/react";
import { getroomdata } from "@/app/action/room";
import { useRouter } from "next/navigation";
import socket from "@/app/socket";
import { fetchuser } from "@/app/action/interaction";
import { toast } from "react-toastify";
import { startgamerendering } from "@/app/action/room";
import Link from "next/link";

const page = ({ params }) => {
    const roomID = React.use(params).roomID;

    const [players, setPlayers] = useState([]);
    const [playerinfo, setPlayerinfo] = useState(null);
    const { data: session, status } = useSession();
    const [gamestarted, setGamestarted] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const isHostRef = useRef(false);
    const [roomInfo, setRoomInfo] = useState(null);
    const [message, setMessage] = useState("");
    const [roomMessages, setRoomMessages] = useState([]);
    const router = useRouter();

    // Word & guessing
    const [word, setword] = useState("");
    const wordRef = useRef("");
    const [revealedLetters, setRevealedLetters] = useState({}); // { index: letter }
    const [chatLocked, setChatLocked] = useState(false);        // locked after correct guess
    const [latestHint, setLatestHint] = useState("");           // tracks latest revealed letter hint

    // Timer
    const [timerstarted, setTimerstarted] = useState(false);
    const timerstartedRef = useRef(false);
    const [timerobj, setTimerobj] = useState({ minutes: 2, seconds: 0 });

    // Round scores (this session only, resets each round)
    const [roundScores, setRoundScores] = useState([]);
    const [roundEnded, setRoundEnded] = useState(false);
    const [roundWord, setRoundWord] = useState("");

    // ─────────────────────────────────────────────────────────────
    // Socket connect
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket.connected) socket.connect();
        socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
        return () => socket.off("connect");
    }, []);

    // ─────────────────────────────────────────────────────────────
    // Auth guard
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (status === "loading") return;
        if (!session) router.push("/login");
    }, [session, status, router]);

    // ─────────────────────────────────────────────────────────────
    // Fetch room data & determine host
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        async function getroom() {
            const res = await getroomdata(roomID);
            setRoomInfo(res.room);
            if (res.status === 200) {
                setPlayers(res.room.players || []);
                const hostPlayer = (res.room.players || []).find(
                    (p) => p.email === session?.user?.email && p.role === "host"
                );
                const amHost = !!hostPlayer;
                setIsHost(amHost);
                isHostRef.current = amHost;
            } else {
                toast.error("Room not found");
                router.push("/");
            }
        }
        if (session?.user?.email) getroom();
    }, [session, roomID, router]);

    // ─────────────────────────────────────────────────────────────
    // Fetch player info
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        async function getplayerinfo() {
            const res = await fetchuser(session.user?.email);
            if (res.status === 200) setPlayerinfo(res.user);
            else setPlayerinfo(null);
        }
        if (session?.user?.email) getplayerinfo();
    }, [session]);

    // ─────────────────────────────────────────────────────────────
    // Join socket room on load (handles refresh)
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!playerinfo || !session?.user?.email) return;
        if (!socket.connected) socket.connect();
        socket.emit("join-room", roomID, playerinfo.username, session.user.email);
    }, [playerinfo, session, roomID]);

    // ─────────────────────────────────────────────────────────────
    // Room deleted / player join-leave updates
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleRoomDeleted = (data) => {
            if (data.reason === "host-left") toast.error("The host left. Room cancelled.");
            else toast.error("Room was deleted.");
            router.push("/");
        };
        const handlePlayerUpdate = async () => {
            const res = await getroomdata(roomID);
            if (res.status === 200) setPlayers(res.room.players || []);
        };
        socket.on("room-deleted", handleRoomDeleted);
        socket.on("player-left", handlePlayerUpdate);
        socket.on("user_joined", handlePlayerUpdate);
        return () => {
            socket.off("room-deleted", handleRoomDeleted);
            socket.off("player-left", handlePlayerUpdate);
            socket.off("user_joined", handlePlayerUpdate);
        };
    }, [roomID, router]);

    // ─────────────────────────────────────────────────────────────
    // Buzz host — only host receives via backend routing
    // ─────────────────────────────────────────────────────────────
    const isHostRef2 = useRef(false);
    useEffect(() => { isHostRef2.current = isHost; }, [isHost]);

    useEffect(() => {
        const handleBuzzes = (data) => {
            toast.info(`🔔 ${data.username} buzzed you!`, { position: "top-center" });
            alert(`🔔 Player "${data.username}" has buzzed you!`);
        };
        socket.on("BUZZES", handleBuzzes);
        return () => socket.off("BUZZES", handleBuzzes);
    }, []);

    const Buzzer = () => {
        if (gamestarted) { toast.info("Game already started"); return; }
        if (!session?.user?.email) { toast.error("Please login"); return; }
        if (!socket.connected) socket.connect();
        socket.emit("BUZZED", { roomID, username: playerinfo?.username, email: playerinfo?.email });
        toast.info("🔔 Buzzed the host!");
    };

    // ─────────────────────────────────────────────────────────────
    // Game started notification
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        socket.on("game-started", (data) => {
            const host = data?.startedBy || "The host";
            toast.success(`🎮 ${host} started the game! Good luck!`, {
                position: "top-center",
                autoClose: 4000,
                style: {
                    background: "linear-gradient(135deg, #6D28D9, #2563EB)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "16px",
                    borderRadius: "12px",
                },
                icon: "🚀",
            });
            setGamestarted(true);
            setRoundEnded(false);
            setRoundScores([]);
            setChatLocked(false);
            setLatestHint("");
        });
        return () => socket.off("game-started");
    }, []);

    useEffect(() => {
        console.log("Checking if game has started for room:", roomID);
        socket.emit("is-game-started", roomID);
        socket.on("game-has-started", () => setGamestarted(true));
        return () => socket.off("game-has-started");
    }, []);

    // ─────────────────────────────────────────────────────────────
    // Leave room
    // ─────────────────────────────────────────────────────────────
    const leaveroomhandling = () => {
        if (!session?.user?.email) { toast.error("Please login first"); return; }
        if (!socket.connected) socket.connect();
        socket.emit("leave-room", roomID, session.user.email);
        socket.on("error-leaving-room", (rid, email) => {
            toast.error("Error leaving room");
        });
        toast.info("Leaving room...");
        router.push("/");
    };

    // ─────────────────────────────────────────────────────────────
    // Receive word — reset all word state
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        socket.on("receive-word", (w) => {
            setword(w);
            wordRef.current = w;
            setRevealedLetters({});
            setChatLocked(false);
            setRoundScores([]);
            setRoundEnded(false);
            setLatestHint("");
            console.log("Received word:", w);
        });
        return () => socket.off("receive-word");
    }, []);

    // ─────────────────────────────────────────────────────────────
    // Progressive letter reveal — backend sends one at a time
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        socket.on("reveal-letter", ({ index, letter }) => {
            setRevealedLetters((prev) => ({ ...prev, [index]: letter }));
            setLatestHint(`Letter '${letter.toUpperCase()}' is revealed at position ${index + 1}!`);
        });
        return () => socket.off("reveal-letter");
    }, []);

    // Reveal remaining letters when timer ends (including the last letter)
    useEffect(() => {
        socket.on("reveal-remaining", (finalReveal) => {
            setRevealedLetters((prev) => ({ ...prev, ...finalReveal }));
        });
        return () => socket.off("reveal-remaining");
    }, []);

    // ─────────────────────────────────────────────────────────────
    // Start game (host only)
    // ─────────────────────────────────────────────────────────────
    const giveword = () => socket.emit("send-word", roomID);

    const startgamehandling = async () => {
        const res = await startgamerendering(roomID);
        if (res.status === 200) {
            socket.emit("start-game", roomID, playerinfo?.username);
            socket.emit("start-timer", roomID);
            giveword();
        } else {
            toast.error(res.error || "Cannot start game");
        }
    };

    // ─────────────────────────────────────────────────────────────
    // Timer
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        socket.on("timer-started", (obj) => {
            setTimerstarted(true);
            timerstartedRef.current = true;
            setTimerobj({ minutes: obj[0].minutes, seconds: obj[0].seconds });
        });
        return () => socket.off("timer-started");
    }, []);

    useEffect(() => {
        socket.on("timer-update", (minutes, seconds) => {
            if (timerstartedRef.current) setTimerobj({ minutes, seconds });
        });
        return () => socket.off("timer-update");
    }, []);

    useEffect(() => {
        socket.on("stopped-timer", () => {
            setTimerstarted(false);
            timerstartedRef.current = false;
        });
        return () => socket.off("stopped-timer");
    }, []);

    useEffect(() => {
        socket.on("timer-ended", (data) => {
            setTimerstarted(false);
            timerstartedRef.current = false;
            setGamestarted(false);
            setRoundEnded(true);
            setRoundWord(data.word || "");
            setRoundScores(data.scores || []);
            setLatestHint("");
            console.log("Round ended. Scores:", data.scores);
        });
        return () => socket.off("timer-ended");
    }, []);

    // ─────────────────────────────────────────────────────────────
    // Chat messages
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket.connected) socket.connect();
        const handleReceiveArray = (messages) => {
            if (Array.isArray(messages)) {
                setRoomMessages(
                    messages.map((m) => ({
                        from: m.from || m.username || "Anonymous",
                        text: m.text ?? m.msg ?? "",
                        colour: m.colour,
                    }))
                );
            }
        };
        socket.on("receive-message", handleReceiveArray);
        socket.emit("send-messages-backend", roomID);
        return () => socket.off("receive-message", handleReceiveArray);
    }, [roomID]);

    // ─────────────────────────────────────────────────────────────
    // Send message / guess
    // ─────────────────────────────────────────────────────────────
    const sendmessage = () => {
        if (!message.trim() || !playerinfo || chatLocked) return;
        if (!socket.connected) socket.connect();

        const w = wordRef.current;
        if (gamestarted && w && message.trim().length === w.length) {
            if (message.trim().toLowerCase() === w.toLowerCase()) {
                // Correct guess — reveal full word only to THIS player
                setRevealedLetters(
                    Object.fromEntries(w.split("").map((ch, i) => [i, ch]))
                );
                socket.emit("correct-guess", {
                    roomID,
                    username: playerinfo.username,
                    email: session?.user?.email,
                    colour: "green",
                });
                setChatLocked(true);
            } else {
                socket.emit("wrong-guess", {
                    roomID,
                    username: playerinfo.username,
                    colour: "red",
                    guess: message.trim(),
                });
            }
        } else {
            socket.emit("send-message", {
                message: message.trim(),
                roomID,
                username: playerinfo.username,
                colour: "transparent",
            });
        }
        setMessage("");
    };

    // ─────────────────────────────────────────────────────────────
    // Correct / wrong guess notifications
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        socket.on("player-guessed-correctly", (data) => {
            toast.success(`🎉 ${data.username} guessed it! +${data.points} pts (#${data.position})`, {
                position: "top-center",
                autoClose: 3000,
                style: { background: "#16a34a", color: "white", fontWeight: "bold", borderRadius: "12px" },
            });
            // Update live round scores
            setRoundScores((prev) => {
                const exists = prev.find((p) => p.username === data.username);
                if (exists) return prev;
                return [...prev, { username: data.username, points: data.points, position: data.position }];
            });
            // Only reveal the full word to the player who guessed it (already done in sendmessage)
            // Everyone else keeps seeing only the progressively revealed letters — do NOT setRevealedLetters here
        });
        return () => socket.off("player-guessed-correctly");
    }, []);

    useEffect(() => {
        socket.on("player-guess-is-wrong", (data) => {
            toast.error(`❌ ${data.username}: "${data.guessedWord}" is wrong`);
        });
        return () => socket.off("player-guess-is-wrong");
    }, []);

    // ─────────────────────────────────────────────────────────────
    // Render helpers
    // ─────────────────────────────────────────────────────────────

    // Letter display — _ _ g _ _ style, each slot is always visible
    const renderWordBoxes = () => {
        if (!word) return null;
        return (
            <div className="flex gap-4 flex-wrap justify-center items-end">
                {word.split("").map((char, i) => {
                    const revealed = revealedLetters[i];
                    return (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-bold text-white min-w-[1.5rem] text-center">
                                {revealed ? revealed.toUpperCase() : "_"}
                            </span>
                            <div className={`h-[3px] w-8 rounded-full ${
                                revealed ? "bg-purple-400" : "bg-gray-500"
                            }`} />
                        </div>
                    );
                })}
            </div>
        );
    };

    // Round ended overlay
    const renderRoundEnd = () => {
        if (!roundEnded) return null;
        return (
            <div className="absolute inset-0 bg-black/80 rounded-3xl flex flex-col items-center justify-center z-10 gap-4 p-6">
                <h2 className="text-2xl font-bold text-white">🏁 Round Over!</h2>
                <p className="text-gray-300">The word was: <span className="text-purple-400 font-bold text-xl uppercase">{roundWord}</span></p>
                <div className="w-full max-w-xs">
                    {roundScores.length > 0 ? (
                        roundScores.map((s, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-white font-semibold">#{s.position} {s.username}</span>
                                <span className="text-yellow-400 font-bold">+{s.points} pts</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-center">No one guessed the word!</p>
                    )}
                </div>
                {isHost && (
                    <button
                        onClick={startgamehandling}
                        className="mt-4 cursor-pointer bg-gradient-to-r from-green-500 to-teal-500
                            text-white px-6 py-3 rounded-full font-semibold text-lg
                            shadow-lg hover:scale-105 transition-transform duration-200"
                    >
                        Next Round
                    </button>
                )}
                {!isHost && <p className="text-gray-400 text-sm">Waiting for host to start next round...</p>}
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────
    return (
        <>
            <Nav />
            <div className="flex justify-center mt-30 flex-col items-center w-full">
                {/* Header Section */}
                <div className="flex justify-center gap-250 items-center relative w-full mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Room ID: {roomID}</h1>
                    </div>
                    <div>
                        <img className="w-50" src="/logo.png" alt="logo" />
                    </div>
                    <button
                        onClick={leaveroomhandling}
                        className="
                            cursor-pointer
                            absolute right-10 top-1/2 -translate-y-1/2
                            bg-gradient-to-r from-red-600 to-pink-600
                            text-white px-6 py-3 rounded-full font-semibold text-lg
                            shadow-lg hover:scale-110 transition-transform duration-300
                            hover:shadow-[0_0_25px_#DC2626]
                        "
                    >
                        Leave Room
                    </button>
                </div>

                <div className="rounded-3xl w-[80vw] h-[80vh] flex gap-6">

                    {/* ── Left: Players ── */}
                    <div className="w-1/4 h-[50%] border rounded-3xl flex flex-col">
                        <div className="border rounded-3xl h-full overflow-hidden">
                            <ul className="flex flex-col h-full justify-start gap-2 p-3 overflow-y-auto">
                                {players.length > 0 ? (
                                    players.map((player, index) => {
                                        const score = roundScores.find(s => s.username === player.username);
                                        return (
                                            <li
                                                key={player.email || index}
                                                className="border rounded-3xl flex items-center justify-between p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/profile/${player.username}`} target="_blank">
                                                        <img
                                                            className="w-12 h-12 rounded-full object-cover"
                                                            src={player.profilepic}
                                                            alt="player avatar"
                                                        />
                                                    </Link>
                                                    <div>
                                                        <h2 className="font-semibold">{player.username || "Player"}</h2>
                                                        <p className="text-sm text-gray-500">{player.role || ""}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {score ? (
                                                        <span className="text-yellow-400 font-bold text-sm">+{score.points} pts</span>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm font-bold">{player.points ?? 0} pts</span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="p-3 text-center text-gray-500">No players yet</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* ── Middle: Game Area ── */}
                    <div className="rounded-3xl w-1/2 h-[100%] border flex flex-col relative">
                        {renderRoundEnd()}

                        <div className="border h-2/5 rounded-3xl flex flex-col items-center justify-center gap-4 p-4">
                            {gamestarted ? (
                                <>
                                    {/* Timer and Hint */}
                                    {timerstarted && (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-lg font-mono">
                                                ⏱ {timerobj.minutes}:{String(timerobj.seconds).padStart(2, "0")}
                                            </div>
                                            {latestHint && (
                                                <div className="text-yellow-400 font-semibold text-sm animate-pulse bg-gray-900/60 px-4 py-2 rounded-full border border-yellow-600/30">
                                                    💡 {latestHint}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Word boxes */}
                                    {renderWordBoxes()}
                                    {/* Chat locked notice */}
                                    {chatLocked && (
                                        <p className="text-green-400 text-sm font-semibold mt-1">
                                            ✅ You guessed correctly! Chat locked until round ends.
                                        </p>
                                    )}
                                </>
                            ) : isHost ? (
                                <button
                                    className="
                                        cursor-pointer bg-gradient-to-r from-green-500 to-teal-500
                                        text-white px-6 py-3 rounded-full font-semibold text-lg
                                        shadow-lg hover:scale-105 transition-transform duration-200
                                    "
                                    onClick={startgamehandling}
                                >
                                    Start Game
                                </button>
                            ) : (
                                <button
                                    onClick={Buzzer}
                                    className="
                                        cursor-pointer bg-gradient-to-r from-yellow-500 to-orange-500
                                        text-white px-6 py-3 rounded-full font-semibold text-lg
                                        shadow-lg hover:scale-105 transition-transform duration-200
                                    "
                                >
                                    🔔 BUZZ HOST
                                </button>
                            )}
                        </div>

                        {/* Game area placeholder */}
                        <div className="flex-1 p-4" />
                    </div>

                    {/* ── Right: Chat ── */}
                    <div className="w-1/4 h-[100%] border rounded-3xl p-4 flex flex-col">
                        <div className="flex-1 overflow-y-auto mb-4 w-full flex flex-col gap-1">
                            {roomMessages && roomMessages.length > 0 ? (
                                roomMessages.map((m, i) => (
                                    <div key={i} className="mb-1">
                                        <strong className="text-sm">{m.from}: </strong>
                                        <span
                                            className={`text-sm px-1 rounded ${
                                                m.colour === "green"
                                                    ? "bg-green-700 text-white"
                                                    : m.colour === "red"
                                                    ? "bg-red-700 text-white"
                                                    : m.colour === "gold"
                                                    ? "bg-yellow-600 text-white"
                                                    : "text-gray-200"
                                            }`}
                                        >
                                            {m.text}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500">No messages yet</div>
                            )}
                        </div>

                        {/* Chat input — locked if player guessed correctly */}
                        <div className="flex items-center gap-2">
                            <input
                                placeholder={chatLocked ? "✅ You guessed it! Waiting for round end..." : "Enter Chat or Guess Word"}
                                className={`text-white w-full p-2 rounded border transition-all ${
                                    chatLocked
                                        ? "bg-gray-800 border-green-700 text-gray-400 cursor-not-allowed"
                                        : "bg-black border-gray-600"
                                }`}
                                type="text"
                                disabled={chatLocked}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") sendmessage(); }}
                                value={message}
                            />
                            <img
                                src="/send.png"
                                alt="Send"
                                className={`ml-2 w-10 h-10 ${chatLocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                onClick={sendmessage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default page;
