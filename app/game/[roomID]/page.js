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
    const [message, setMessage] = useState("");
    const [roomMessages, setRoomMessages] = useState([]);
    const router = useRouter();
    const [word, setword] = useState("")
    const wordRef = useRef("");
    const [guessedletters,setguessedletters]=useState([]);
    const [timerstarted, setTimerstarted] = useState(false);
    const timerstartedRef = useRef(false);
    const [timerobj, setTimerobj] = useState([]);
    // const roomchats=new Map();
     
    useEffect(() => {
      if (!socket) {
        console.warn("Socket not initialized");
        return;
      }

      if (!socket.connected) {
        socket.connect();
      }

      const handleReceiveMessages = (data) => {
        console.log("Messages from backend:", data);
      };

      socket.on("send-messages-backend", handleReceiveMessages);
    
      return () => {
        socket.off("send-messages-backend", handleReceiveMessages);
      }
    }, [params.roomID])
    
    // useEffect(() => {
    //   socket.emit("store-room-data",params.roomID);
    // }, [])
    

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
                // console.log("Room data:", res.room.players);
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

    // Ensure this client socket joins the room when playerinfo is ready
    useEffect(() => {
        if (!playerinfo || !session?.user?.email) return;
        if (!socket.connected) {
            try {
                socket.connect();
            } catch (err) {
                console.error("Socket connect error while joining room:", err);
            }
        }
        try {
            socket.emit("join-room", params.roomID, playerinfo.username, session.user.email);
            // console.log("Emitted join-room for room", params.roomID, playerinfo.username);
        } catch (err) {
            console.error("Error emitting join-room:", err);
        }
    }, [playerinfo, session, params.roomID]);
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

        // console.log("Buzzer clicked for room:", roomId);

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

            // console.log("Setting up BUZZES listener");
            const handleBuzzes = (data) => {
                // console.log("Buzz data received:", data);
                alert(`Player ${data.username} has buzzed!`);
            };

            socket.on("BUZZES", handleBuzzes);

            return () => {
                try {
                    socket.off("BUZZES", handleBuzzes);
                    // console.log("Removed BUZZES listener");
                } catch (err) {
                    console.error("Error removing BUZZES listener:", err);
                }
            };
        } catch (err) {
            console.error("Error setting up BUZZES listener:", err);
        }
    }, []);

    useEffect(() => {
      if (!socket) {
                console.warn("Socket not initialized");
                return;
            }

            if (!socket.connected) {
                socket.connect();
            }

      socket.on("game-started", () => {
                alert("Game started by the host!");
                setGamestarted(true);
            });
    
      return () => {
        socket.off("game-started");
      }
    }, [])

    useEffect(() => {
      console.log("Checking if game has started for room:", params.roomID);
      socket.emit("is-game-started",(params.roomID));
      return () => {
       socket.off("is-game-started");
      }
    }, [])

    useEffect(() => {
      socket.on("game-has-started",()=>{
        setGamestarted(true);
        console.log("Game has started - notified by backend");
      });
    
      return () => {
        socket.off("game-has-started");
      }
    }, [])

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

    useEffect(() => {
      socket.on("receive-word",(word)=>{
            setword(word);
            wordRef.current = word;
            // guessedletters([]);
            if (word) {
                console.log("Received word from backend:", word);
            } else {
                console.warn("Received word is undefined or empty");
            }
        });
        return () => {
            socket.off("receive-word");
        };
    }, [])
    

    const giveword=()=>{
        socket.emit("send-word", params.roomID);
    }

    const startgamehandling = async () => {
        const roomid = params.roomID;
        const res = await startgamerendering(roomid);
        if (res.status === 200) {
            socket.emit("start-game", roomid);
            socket.emit("start-timer",roomid);
            giveword();
            socket.on("error-starting-game", (roomid) => {
                toast.error("Error starting game");
                console.error("Failed to start game:", roomid);
            });
            
        } else {
            toast.error(res.error || "Cannot start game");
            console.log(res.status);
            console.error(res.error);
            alert(res.status);
        }
    };

    useEffect(() => {
      socket.on("timer-started",(obj)=>{
        setTimerstarted(true);
        timerstartedRef.current = true;
        setTimerobj([{minutes:obj[0].minutes,seconds:obj[0].seconds}])
        console.log("Timer started data:",obj);
      })

      return () => {
        socket.off("timer-started");
      }
    }, [])

    useEffect(() => {
      socket.on("timer-update",(minutes,seconds)=>{
        // console.log("Timer update data:",minutes,seconds);
        if (timerstartedRef.current) {
          setTimerobj([{minutes:minutes,seconds:seconds}])
        }
      })
      return () => {
        socket.off("timer-update");
      }
    }, [])
    
   useEffect(() => {
     socket.on("timer-ended",(roomid)=>{
        setTimerstarted(false);
        timerstartedRef.current = false;
        setTimerobj([]);
        setGamestarted(false);
        setword("");
        setguessedletters([]);
        console.log("Timer ended for room:",roomid);
     })
    console.log("timer ended successfully");
   }, [])
   
    

    
   useEffect(() => {
    if (!socket) {
        console.warn("Socket not initialized");
        return;
    }

    if (!socket.connected) {
        socket.connect();
    }

    const handleReceiveMessage = (roomChats) => {
        console.log("Received message data:", roomChats);

        if (!roomChats) {
            console.warn("roomChats is null or undefined");
            return;
        }
        if (Array.isArray(roomChats)) {
            const normalized = roomChats.map(m => ({ from: m.from || m.username || 'Anonymous', text: m.text ?? m.msg ?? '', colour: m.colour }));
            setRoomMessages(normalized);
            return;
        }
        if (typeof roomChats === 'object') {
            const obj = roomChats[params.roomID] || roomChats[params.roomId] || roomChats.roomID;
            console.log("Messages for this room (from map):", obj);
            if (Array.isArray(obj)) {
                const normalized = obj.map(m => ({ from: m.from || m.username || 'Anonymous', text: m.text ?? m.msg ?? '', colour: m.colour }));
                setRoomMessages(normalized);
                return;
            }
        }

        console.warn("No messages found for this room or invalid format");
    };

    socket.on("send-message-map", handleReceiveMessage);
    const handleReceiveArray = (messages) => {
        console.log("Received broadcasted messages for room:", messages);
        if (Array.isArray(messages)) {
            const normalized = messages.map(m => ({ from: m.from || m.username || 'Anonymous', text: m.text ?? m.msg ?? '' ,colour:m.colour}));
            console.log(roomMessages);
            setRoomMessages(normalized);
        }
    };
    socket.on("receive-message", handleReceiveArray);

    return () => {
        socket.off("send-message-map", handleReceiveMessage);
        socket.off("receive-message", handleReceiveArray);
    };
}, [params.roomID]);
    

    const sendmessage = async () => {
        console.log("Sending message:", message);
        if (!socket.connected) {
            try {
                socket.connect();
            } catch (err) {
                console.error("Socket connect error:", err);
            }
        }
        const res = await getroomdata(params.roomID);
        if(res.status !== 200){
            toast.error("Room not found");
            return;
        }
        if(gamestarted && word && message.length===word.length){
           if(message.toLowerCase()===word.toLowerCase()){
            // toast.success();
            setguessedletters(word.split(""));
            socket.emit("correct-guess",({roomID:params.roomID,username: playerinfo?.username,colour:"green"}));
            console.log("Correct guess sent:", message,params.roomID, playerinfo?.username);
           }
           else{
            socket.emit("wrong-guess",({roomID:params.roomID,username: playerinfo?.username,colour:"red",guess:message}));
            toast.info("Wrong Guess!");
            console.log("Wrong guess sent:", message,params.roomID, playerinfo?.username);
           }
        }
        else{
            socket.emit("send-message",({message:message, roomID:params.roomID,username: playerinfo?.username,colour:"transparent"} ));
        }
        console.log("Message sent:", message,params.roomID, playerinfo?.username);
        setMessage("");
    }

    useEffect(() => {
      socket.on("player-guessed-correctly",(data)=>{
        alert(`Player ${data.username} guessed the word correctly!`);
        // console.log("word to reveal:",wordRef.current);
        // console.log("Player guessed correctly data:",data);
        setguessedletters(wordRef.current.split(""));
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit("stop-timer",params.roomID);
        setTimerstarted(false);
        setTimerobj([]);

      })
      return () => {
        socket.off("player-guessed-correctly");
      }
    }, [])

    useEffect(() => {
      socket.on("stopped-timer",(roomid)=>{
        console.log("timer stopped");
        setTimerstarted(false);
        timerstartedRef.current = false;
        setTimerobj([]);
      });
      return () => {
        socket.off("stopped-timer")
      }
    }, [])

    useEffect(() => {
      socket.on("player-guess-is-wrong",(data)=>{
        const roomid=data.roomID;
        const username=data.username;

        alert(`${username} gueessed wrong`);
      })
    
      return () => {
        socket.off("player-guess-is-wrong");
      }
    }, [])
    
    
    

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
                    <div className="w-1/4 h-[50%] border rounded-3xl flex flex-col">
                        <div className="border rounded-3xl h-full overflow-hidden">
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
                        {/* <div className="border rounded-3xl h-1/2 flex items-center justify-center">
                            <h1 className="text-3xl text-center font-bold">
                                Leaderboard
                            </h1>
                        </div> */}
                    </div>

                    {/* middle section */}
                    <div className="rounded-3xl w-1/2 h-[100%] border flex flex-col">
                        <div className="border h-2/5 rounded-3xl flex items-center justify-center">
                            {gamestarted ? (
                                  <>
  {timerstarted && timerobj.length > 0 && (
    <div className="  bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-lg font-mono">
      Timer: {timerobj[0].minutes}:
      {timerobj[0].seconds.toString().padStart(2, "0")}
    </div>
  )}

  {word.split("").map((char, index) => (
    <span key={index} className="mx-1 text-3xl">
      {guessedletters.includes(char) ? char : "_"}
    </span>
  ))}
</>
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
                                    onClick={()=>{Buzzer()}}
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
                    <div className="w-1/4 h-[100%] border rounded-3xl p-4 flex flex-col">
                        <div className="flex-1 overflow-y-auto mb-4 w-full">
                            {roomMessages && roomMessages.length > 0 ? (
                                roomMessages.map((m, i) => (
                                    <div key={i} className="mb-2 flex items-center  gap-3.5">
                                        <strong className="block">{m.from || 'Anonymous'}</strong>
                                        <div className={`text-sm text-white ${m.colour === 'green' ? 'bg-green-500' : m.colour === 'red' ? 'bg-red-500' : ''}`}>{m.text}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500">No messages yet</div>
                            )}
                        </div>
                        <div className="flex items-center">
                            <input 
                                placeholder="Enter Chat or Guess Word" 
                                className="bg-black text-white w-full p-2 rounded border" 
                                type="text"
                                onChange={(e)=>{setMessage(e.target.value)}}
                                 onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    sendmessage();
                                  }
                                }}
                                value={message}
                            />
                            <img 
                                src="/send.png" 
                                alt="Send" 
                                className="ml-2 cursor-pointer w-10 h-10" 
                                onClick={()=>{sendmessage()}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default page;
