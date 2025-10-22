"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// import { toast } from 'react-hot-toast';
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
// server actions should not be imported into client components

export default function Page({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilepic, setProfilepic] = useState("");
  useEffect(() => {
    // if (status === "loading") return;

    if (!session) {
      toast.info("Please Login First");
      router.push("/login");
    }
    setEmail(session.user?.email || "");
  }, [session, status, router]);

  useEffect( () => {
    if (!session) return;
    // call the server API we added to fetch DB-backed user data
    (async () => {
      try {
        const resp = await fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`);
        const json = await resp.json();
        if (resp.ok && json.user) {
          setUsername(json.user.username || "");
          setProfilepic(json.user.profilepic || "");
        } else {
          toast.error(json.error || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('client fetch /api/user error:', err);
        toast.error('An error occurred while fetching user data');
      }
    })();
  }, [session]);

  return (
    <div className="flex">
      {/* Left side */}
      <div className="bg-red-600 w-[50%] h-[100vh]"></div>

      {/* Right side */}
      <div className="w-[50%] h-[100vh] flex justify-center items-center">
        <div className="backdrop-blur-md bg-white/10 border border-white/30 p-14 rounded-2xl shadow-2xl flex flex-col gap-8 w-[70%] max-w-md text-white">
          <h2 className="text-3xl font-semibold tracking-wide mb-2 text-center">
            Your Profile
          </h2>

          {/* Email */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-200">Email</label>
            <input
              className="border border-white/20 bg-white/20 rounded-md px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
              type="email"
              value={email}
              placeholder="you@example.com"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-200">
              Username
            </label>
            <input
              value={username}
              className="border border-white/20 bg-white/20 rounded-md px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
              type="text"
              placeholder="Your cool username"
            />
          </div>

          {/* Profile pic URL */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-200">
              Profile Picture URL
            </label>
            <input
              className="border border-white/20 bg-white/20 rounded-md px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
              type="text"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button className="cursor-pointer mt-6 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all hover:scale-[1.03]">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
