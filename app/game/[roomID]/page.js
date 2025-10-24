"use client";
import React from "react";
import { useState } from "react";
// import logo from '../../../public/logo.jpg'
import { useSession } from "next-auth/react";
import Nav from "@/app/components/nav";
import { useEffect } from "react";
import { getroomdata } from "@/app/action/room";

const page = ({ params }) => {
  // const [setstartgame, setSetstartgame] = useState(false);
  const { data: session } = useSession();
  const [players, setPlayers] = useState([]);
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

  return (
    <>
      <Nav />
      <div className="flex justify-center mt-30 flex-col items-center">
        <div className="flex justify-center gap-250 items-center ">
          <div>
            <h1 className="text-3xl font-bold">Room ID: {params.roomID}</h1>
          </div>
          <div>
            <img className="w-50" src="/logo.png" alt="" />
          </div>
        </div>
        <div className="rounded-3xl  w-[80vw] h-[80vh] flex">
          {/* left section */}
          <div className="w-1/4 h-[100%] border rounded-3xl">
            {/*left upper*/}
            <div className="border rounded-3xl h-1/2">
              <ul className="flex flex-col h-full justify-start gap-2 p-3 overflow-y-auto">
                {players.map((player, index) => (
                <li key={index} className="border rounded-3xl flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={player.profilepic}
                      alt="player avatar"
                    />
                    {console.log("Profile Pic",player.profilepic)}
                    <div>
                      <h2 className="font-semibold">{player.username || "Player"}</h2>
                      <p className="text-sm text-gray-500">{player.role || ""}</p>
                    </div>
                  </div>
                  <div className="text-right font-bold">{player.points ?? 0} pts</div>
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
