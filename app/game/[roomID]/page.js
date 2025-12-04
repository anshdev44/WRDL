"use client";
import React from "react";
import { useState, useEffect } from "react";
import Nav from "@/app/components/nav";
import { useSession } from "next-auth/react";
import { getroomdata } from "@/app/action/room";
import { useRouter } from "next/navigation";
import socket from "@/app/socket";
import { fetchuser } from "@/app/action/interaction";
import { toast } from "react-toastify";
import { set } from "mongoose";
import { startgamerendering } from "@/app/action/room";
import Link from "next/link";

const page = ({ params }) => {
    const [players, setPlayers] = useState([]);
    const [playerinfo, setPlayerinfo] = useState(null);
    const { data: session, status } = useSession();
    const [gamestarted, setGamestarted] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [roomInfo, setRoomInfo] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login");
            return;
        }
    }, [session, status, router]);

    useEffect(() => {
        async function getroom() {
            const res = await getroomdata(params.roomID);
            setRoomInfo(res.room);
            if (res.status === 200) {
                setPlayers(res.room.players || []);
                console.log("Room data:", res.room.players);
                const hostPlayer = (res.room.players || []).find(
                    (p) => p.email === session?.user?.email && p.role === "host"
                );
                setIsHost(!!hostPlayer);
            } else {
                console.log("Room not found");
                toast.error("Room not found");
                router.push("/");
            }
        }
        if (session?.user?.email) {
            getroom();
        }
    }, [session, params.roomID, router]);

    useEffect(() => {
        async function getplayerinfo() {
            const res = await fetchuser(session.user?.email);
            if (res.status === 200) {
                setPlayerinfo(res.user);
            } else {
                setPlayerinfo(null);
                console.log("User not found");
            }
        }

        if (session?.user?.email) {
            getplayerinfo();
        }
    }, [session]);
    // console.log("roomid is ", params.roomID);

    const Buzzer = () => {
        if (gamestarted) {
            toast.info("Game already started");
            return;
        }
        if (!session?.user?.email) {
            toast.error("Please login");
            return;
        }

        const roomId = params.roomID;

        console.log("Buzzer clicked for room:", roomId);

        // ensure socket is connected
        if (!socket.connected) {
            try {
                socket.connect();
            } catch (err) {
                console.error("Socket connect error:", err);
            }
        }

        try {
            socket.emit("BUZZED", {
                roomID: roomId,
                username: playerinfo?.username,
                email: playerinfo?.email,
            });
            toast.info("Buzzed the host!");
        } catch (err) {
            console.error("Error in buzzer:", err);
            toast.info("Failed to buzz host");
        }
    };

    useEffect(() => {
        try {
            if (!socket) {
                console.warn("Socket not initialized");
                return;
            }

            if (!socket.connected) {
                socket.connect();
            }

            console.log("Setting up BUZZES listener");
            const handleBuzzes = (data) => {
                console.log("Buzz data received:", data);
                alert(`Player ${data.username} has buzzed!`);
            };

            socket.on("BUZZES", handleBuzzes);

            return () => {
                try {
                    socket.off("BUZZES", handleBuzzes);
                    console.log("Removed BUZZES listener");
                } catch (err) {
                    console.error("Error removing BUZZES listener:", err);
                }
            };
        } catch (err) {
            console.error("Error setting up BUZZES listener:", err);
        }
    }, []);

    const leaveroomhandling = () => {
        const roomid = params.roomID;
        if (!session?.user?.email) {
            toast.error("Please login first");
            return;
        }

        if (!socket.connected) {
            try {
                socket.connect();
            } catch (err) {
                console.error("Socket connect error:", err);
            }
        }

        try {
            socket.emit("leave-room", roomid, session.user.email);

            socket.on("error-leaving-room", (roomId, email) => {
                toast.error("Error leaving room");
                console.error("Failed to leave room:", roomId, email);
            });
            toast.info("Leaving room...");
            router.push("/");
        } catch (err) {
            console.error("Error in leave room:", err);
            toast.error("Failed to leave room");
        }
    };

    const startgamehandling = async () => {
        const roomid = params.roomID;
        const res = await startgamerendering(roomid);
        if (res.status === 200) {
            socket.emit("start-game", roomid);
            socket.on("error-starting-game", (roomid) => {
                toast.error("Error starting game");
                console.error("Failed to start game:", roomid);
            });
            socket.on("game-started", () => {
                alert("Game started by the host!");
                setGamestarted(true);
            });
        } else {
            toast.error(res.error || "Cannot start game");
            console.log(res.status);
            console.error(res.error);
            alert(res.status);
        }
    };

    return (
        <>
            <Nav />
            <div className="flex justify-center mt-30 flex-col items-center w-full">
                {/* Header Section */}
                <div className="flex justify-center gap-250 items-center relative w-full mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Room ID: {params.roomID}
                        </h1>
                    </div>
                    <div>
                        <img className="w-50" src="/logo.png" alt="logo" />
                    </div>

                    {/* Leave Room Button */}
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
                    {/* left section */}
                    <div className="w-1/4 h-[100%] border rounded-3xl flex flex-col">
                        <div className="border rounded-3xl h-1/2 overflow-hidden">
                            <ul className="flex flex-col h-full justify-start gap-2 p-3 overflow-y-auto">
                                {players.length > 0 ? (
                                    players.map((player, index) => (
                                        <li
                                            key={player.email || index}
                                            className="border rounded-3xl flex items-center justify-between p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/profile/${player.username}`}
                                                    target="_blank"
                                                >
                                                    <img
                                                        className="w-12 h-12 rounded-full object-cover"
                                                        src={player.profilepic}
                                                        alt="player avatar"
                                                    />
                                                </Link>
                                                <div>
                                                    <h2 className="font-semibold">
                                                        {player.username ||
                                                            "Player"}
                                                    </h2>
                                                    <p className="text-sm text-gray-500">
                                                        {player.role || ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right font-bold">
                                                {player.points ?? 0} pts
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-3 text-center text-gray-500">
                                        No players yet
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="border rounded-3xl h-1/2 flex items-center justify-center">
                            <h1 className="text-3xl text-center font-bold">
                                Leaderboard
                            </h1>
                        </div>
                    </div>

                    {/* middle section */}
                    <div className="rounded-3xl w-1/2 h-[100%] border flex flex-col">
                        <div className="border h-2/5 rounded-3xl flex items-center justify-center">
                            {gamestarted ? (
                                <h1 className="text-3xl text-center font-bold">
                                    Word
                                </h1>
                            ) : isHost ? (
                                <button
                                    className="
                    cursor-pointer bg-gradient-to-r from-green-500 to-teal-500
                    text-white px-6 py-3 rounded-full font-semibold text-lg
                    shadow-lg hover:scale-105 transition-transform duration-200
                  "
                                    onClick={() => {
                                        startgamehandling();
                                    }}
                                >
                                    Start Game
                                </button>
                            ) : (
                                <button
                                    onClick={Buzzer}
                                    className="
                    cursor-pointer bg-gradient-to-r from-green-500 to-teal-500
                    text-white px-6 py-3 rounded-full font-semibold text-lg
                    shadow-lg hover:scale-105 transition-transform duration-200
                  "
                                >
                                    BUZZ HOST
                                </button>
                            )}
                        </div>

                        {/* game area or other content */}
                        <div className="flex-1 p-4">
                            {" "}
                            {/* placeholder for game UI */}{" "}
                        </div>
                    </div>

                    {/* right section */}
                    <div className="w-1/4 h-[100%] border rounded-3xl p-4">
                        <h1 className="text-3xl text-center font-bold">Chat</h1>
                    </div>
                </div>
            </div>
        </>
    );
};

export default page;
