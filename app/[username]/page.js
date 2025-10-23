"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { fetchuser, updateuser } from "../action/interaction";
import { motion } from "framer-motion";
import Nav from "../components/nav";

export default function Page({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilepic, setProfilepic] = useState("");

  useEffect(() => {
    if (!session) {
      toast.info("Please Login First");
      router.push("/login");
      return;
    }
    setEmail(session.user?.email || "");
  }, [session, status, router]);

  useEffect(() => {
    if (!email) return;
    (async () => {
      const res = await fetchuser(email);
      if (res.status === 200) {
        setUsername(res.user.username || "");
        setProfilepic(res.user.profilepic || "");
        toast.success("User data loaded successfully");
      } else toast.error("Could not load user data");
    })();
  }, [email]);

  const handlesubmit = async () => {
    const res = await updateuser({ email, username, profilepic });
    if (res.status !== 200) {
      if (res.status === 409) toast.error("Username already exists");
      else toast.error("User not found. Please log in first.");
    } else toast.success("Profile updated successfully");
  };

  return (
    <>
    <Nav />
    <div className="flex min-h-screen overflow-hidden">
      {/* LEFT SIDE */}
      <div className="relative  bg-gradient-to-br from-red-700 to-red-900 w-1/2 flex flex-col justify-center items-center text-white overflow-hidden">
        {/* floating alphabets */}
        <div className="absolute inset-0 opacity-10 select-none text-[120px] font-bold tracking-widest animate-pulse">
          <div className="absolute top-10 left-12">A</div>
          <div className="absolute top-1/3 right-10">W</div>
          <div className="absolute bottom-20 left-20">R</div>
          <div className="absolute bottom-10 right-16">D</div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold tracking-widest z-10"
        >
          PLAYER HUB
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-white/80 text-center max-w-sm mt-4 z-10"
        >
          Update your gamer tag, avatar, and claim your next word battle.
        </motion.p>
      </div>

      {/* RIGHT SIDE */}
      <div className="bg-black w-1/2 flex justify-center items-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative backdrop-blur-xl bg-white/5 border border-white/20 p-10 rounded-2xl shadow-2xl flex flex-col gap-6 w-[80%] max-w-md text-white z-10"
        >
          <h2 className="text-3xl font-bold tracking-wider text-center mb-2">
            Profile Settings
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full border border-white/20 bg-white/10 rounded-md px-4 py-2 text-white cursor-not-allowed"
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-400">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                className="w-full border border-white/20 bg-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
              />
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="text-sm font-medium text-gray-400">
                Profile Picture URL
              </label>
              <input
                type="text"
                value={profilepic}
                onChange={(e) => setProfilepic(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full border border-white/20 bg-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
              />
            </div>

            {/* Profile Preview */}
            {profilepic && (
              <div className="flex justify-center mt-4">
                <motion.img
                  src={profilepic}
                  alt="Profile Preview"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-24 h-24 rounded-full border-2 border-red-600 shadow-lg"
                />
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlesubmit}
            className="mt-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200"
          >
            Save Changes
          </motion.button>
        </motion.div>
        <ToastContainer position="bottom-center" theme="dark" />
      </div>
    </div>
    </>
  );
}
