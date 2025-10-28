"use client";
import React from "react";
import { useState } from "react";
// import logo from '../../../public/logo.jpg'
import { useSession } from "next-auth/react";
import Nav from "@/app/components/nav";
import { useEffect } from "react";
import { getroomdata } from "@/app/action/room";
import { io, Socket } from "socket.io-client";
import { RouteMatcher } from "next/dist/server/route-matchers/route-matcher";
import { useRouter } from "next/navigation";
// import socket from "";
import socket from "../../socket";
// import usetimeout from "use-timeout";
import { fetchuser } from "@/app/action/interaction";

const page = ({ params }) => {
 console.log("a user with id ",socket.id,"is in the room");
  
  // const [setstartgame, setSetstartgame] = useState(false);
  const { data: session } = useSession();
  const [players, setPlayers] = useState([]);
  const [playerinfo, setPlayerinfo] = useState([]);
  const router = useRouter();


  useEffect(() => {
    async function getroom() {
      const res = await getroomdata(params.roomID);
      if (res.status === 200) {
        setPlayers(res.room.players);
        console.log("Room data:", res.room);
      } else {
        console.log("Room not found");
      }
    }
    getroom();
  }, [session]);

  useEffect(() => {
    async function getplayerinfo() {
      const res = await fetchuser(session.user?.email);
      if(res.status===200){
        setPlayerinfo(res.user);
      }
      else{
        setPlayerinfo(null);
        console.log("User not found");
      }
    }
    getplayerinfo();
  }, [session])
  

  return (
    <>
      <Nav />
      <div className="flex justify-center mt-30 flex-col items-center">
        {/* Header Section */}
        <div className="flex justify-center gap-250 items-center relative w-full">
          <div>
            <h1 className="text-3xl font-bold">Room ID: {params.roomID}</h1>
          </div>
          <div>
            <img className="w-50" src="/logo.png" alt="" />
          </div>

          {/* Leave Room Button */}
          <button
            onClick={() => {
              // Replace with your actual leave logic (e.g. socket disconnect + redirect)
              socket.emit("leave-room", params.roomID, playerinfo.username);
              router.push("/");
            }}
            className="
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

        <div className="rounded-3xl  w-[80vw] h-[80vh] flex">
          {/* left section */}
          <div className="w-1/4 h-[100%] border rounded-3xl">
            {/* left upper */}
            <div className="border rounded-3xl h-1/2">
              <ul className="flex flex-col h-full justify-start gap-2 p-3 overflow-y-auto">
                {players.map((player, index) => (
                  <li
                    key={index}
                    className="border rounded-3xl flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        className="w-12 h-12 rounded-full object-cover"
                        src={player.profilepic}
                        alt="player avatar"
                      />
                      {console.log("Profile Pic", player.profilepic)}
                      <div>
                        <h2 className="font-semibold">
                          {player.username || "Player"}
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
                ))}
              </ul>
            </div>
            <div className="border rounded-3xl h-1/2">
              <h1 className="text-3xl text-center font-bold">Leaderboard</h1>
            </div>
          </div>

          {/* middle section */}
          <div className="rounded-3xl w-1/2 h-[100%] border flex flex-col">
            <div className="border h-2/5 rounded-3xl">
              <h1 className="text-3xl text-center font-bold">Word</h1>
            </div>
            <div className="border h-3/5 rounded-3xl">
              <div>
                <h1 className="text-3xl text-center font-bold">Hints</h1>
              </div>
            </div>
          </div>

          {/* right section */}
          <div className="w-1/4 h-[100%] border rounded-3xl">
            <h1 className="text-3xl text-center font-bold">Chat</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
