"use client";
import React from "react";
import { motion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveprofile } from "../action/interaction";
// import { save } from "../api/saveuser";


const Page = () => {
  const { data: session } = useSession();
  const [email, setemail] = useState("");
  const [pass, setpass] = useState("");
  const router = useRouter();
  if (session) {
    router.push("/");
  }

  const submitHandler = async (email,pass) => {
      // e.preventDefault();
      const res=await saveprofile({email:email,pass:pass});
      if(res.error){
        alert(`Error: ${res.error}`);
      }
      else{
        alert("login ho gya");
        router.push("/");
      }
 
  }

  const handleChangeemail = (e) => {
    setemail(e.target.value);
  }
  const handleChangepass = (e) => {
    setpass(e.target.value);
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-[#0B0B0B] text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#121212] border border-[#2a2a2a] p-8 rounded-2xl w-96 shadow-[0_0_25px_rgba(80,0,255,0.15)]"
        >
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome 👋
          </h1>

          <div className="space-y-5">
            {/* GitHub Login */}
            <button
              onClick={() => {
                signIn("github");
              }}
              className="cursor-pointer w-full flex items-center justify-center gap-3 bg-[#1B1B1B] border border-[#333] text-white py-2.5 px-4 rounded-lg hover:border-[#555] hover:bg-[#222] transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Continue with GitHub
            </button>
            <button
              onClick={() => {
                signIn("google");
              }}
              className="cursor-pointer w-full flex items-center justify-center gap-3 bg-[#1B1B1B] border border-[#333] text-white py-2.5 px-4 rounded-lg hover:border-[#555] hover:bg-[#222] transition-all duration-300"
            >
              <svg
                className="flex items-center justify-center"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="30"
                height="30"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                ></path>
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                ></path>
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center text-gray-400">
              <div className="flex-1 border-t border-gray-700/50"></div>
              <span className="px-3 text-sm">or</span>
              <div className="flex-1 border-t border-gray-700/50"></div>
            </div>

            {/* email */}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleChangeemail}
              className="w-full px-4 py-2.5 rounded-lg bg-[#181818] placeholder-gray-400 text-white border border-[#2a2a2a] focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-200"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              onChange={handleChangepass}
              className="w-full px-4 py-2.5 rounded-lg bg-[#181818] placeholder-gray-400 text-white border border-[#2a2a2a] focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-200"
            />

            {/* Sign In */}
            <button onClick={()=>{submitHandler(email,pass)}} className=" cursor-pointer w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300">
              Sign In
            </button>
            <div className="flex justify-center">
              <h1>
                Or new to <span className="text-red-600">WRDL</span>{" "}
                <span className="cursor-pointer underline text-blue-300 hover:text-blue-500">
                  Sign UP
                </span>
              </h1>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Page;
