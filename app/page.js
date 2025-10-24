"use client";
import React from "react";
import TextType from "./TextType";
import Nav from "./components/nav";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchuser } from "./action/interaction";
import { createRandomString } from "./action/room";
import { handlejoinroombackend } from "./action/room";

const Page = () => {
  const [joinroom, setJoinroom] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [roomid, setRoomid] = useState("");
  const { data: session } = useSession();

  const tooglejonroom=()=>{
    setJoinroom(prev=>!prev);
  }

  const handlejoinroom = () => {
    async function join() {
      const res= await handlejoinroombackend(roomid,session.user?.email,username);
      if(res.status===200){
        router.push(`/game/${roomid}`);
        toast.info(res.message);
      }
      else{
        toast.error(res.error);
      }
    }
    join();
  }



  useEffect(() => {
    async function getusername() {
      const res = await fetchuser(session.user.email);
      if (res.status === 200) {
        setUsername(res.user.username);
      }
    }
    getusername();
  }, [session]);

  const HandleCreateRoom = async () => {
    if (!session) {
      toast.info("Please Login FIrst Before creating a room");
    } else {
      let room = await createRandomString(session.user?.email, username);
      if (!room) {
        toast.info("servers are busy try again later");
      } else {
        setRoomid(room);
        // console.log("Created room id:",room);
        router.push(`/game/${room}`);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Lights */}
      <div className="absolute top-0 left-0 w-[80%] h-[120%] bg-gradient-to-br from-purple-700/60 via-transparent to-transparent blur-[160px] rotate-[15deg]"></div>
      <div className="absolute top-0 right-0 w-[80%] h-[120%] bg-gradient-to-bl from-blue-600/60 via-transparent to-transparent blur-[160px] -rotate-[15deg]"></div>

      <div className="relative z-10">
        <Nav />

        {/* Hero Section */}
        <div className="flex flex-col items-center gap-20 w-[90%] md:w-[80%] h-auto mx-auto mt-50">
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="mt-20 text-3xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 drop-shadow-[0_0_30px_#00ffff50]">
              <TextType
                text={[
                  "Expand Your Lexicon",
                  "Battle of Words",
                  "Unleash Your Vocabulary",
                  "Conquer the Word Arena",
                  "Master the Art of Words",
                  "Elevate Your Word Power",
                ]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="|"
                loop={true}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-16 mt-8">
            <button
              onClick={() => {
                HandleCreateRoom();
              }}
              className="bg-gradient-to-r from-purple-700 to-blue-600 cursor-pointer text-white px-10 py-4 rounded-full text-xl font-semibold shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-[0_0_25px_#6D28D9]"
            >
              Create Room
            </button>

            <button
              onClick={()=>{tooglejonroom()}}
              className="bg-gradient-to-r from-blue-700 to-purple-600 cursor-pointer text-white px-10 py-4 rounded-full text-xl font-semibold shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-[0_0_25px_#2563EB]"
            >
              Join Room
            </button>
          </div>

          {joinroom && (
            <div className="mt-12 flex flex-col items-center">
              <p className="text-gray-300 mb-4 text-lg">Enter a Room Code :</p>

              {/* Input and Go Button */}
              <div className="flex items-center gap-4 w-full max-w-sm">
                <input
                  placeholder="Enter Room Code"
                  type="text"
                  className="
                                        flex-grow p-3 text-lg rounded-xl 
                                        bg-gray-900 text-white placeholder-gray-500
                                        border-2 border-purple-500 
                                        focus:border-blue-400 focus:ring-1 focus:ring-blue-400 
                                        outline-none transition-all duration-300
                                    "
                  // Optional: Set up focus shadow for neon glow
                  style={{ boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)" }}
                />

                <button
                  onClick={() => {
                    handlejoinroom();
                  }}
                  className="
                                        cursor-pointer px-6 py-3 rounded-xl text-lg font-bold
                                        bg-gradient-to-r from-blue-500 to-purple-500
                                        hover:shadow-[0_0_15px_#8B5CF6] transition-shadow duration-300
                                    "
                >
                  GO
                </button>
              </div>
            </div>
          )}
        </div>

        {/* <div className="mt-[20%]"></div> */}
      </div>
    </div>
  );
};

export default Page;
