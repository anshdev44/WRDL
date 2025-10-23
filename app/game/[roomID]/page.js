"use client"
import React from "react";
import { useState } from "react";
// import logo from '../../../public/logo.jpg'
import Nav from "@/app/components/nav";

const page = ({ params }) => {
  const [setstartgame, setSetstartgame] = useState(false);
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
        <div className="rounded-3xl border w-[80vw] h-[80vh] flex">
          {/* left section */}
          <div className="w-1/4 h-[100%] border rounded-3xl">
            {/*left upper*/}
            <div className="border rounded-3xl h-1/2">
              {/* players list */}
              <ul className="flex flex-col h-full justify-evenly">
                <li className="border rounded-3xl h-1/4 flex items-center justify-center"></li>
                <li className="border rounded-3xl h-1/4 flex items-center justify-center"></li>
                <li className="border rounded-3xl h-1/4 flex items-center justify-center"></li>
                <li className="border rounded-3xl h-1/4 flex items-center justify-center"></li>
              </ul>
            </div>
            {/*left lower*/}
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
