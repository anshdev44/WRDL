"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchprofilepic } from "../action/interaction";
import { useEffect, useState } from "react";

const Nav = () => {
  const router = useRouter();
  const [profile, setprofile] = useState("");
  const { data: session } = useSession();

  const signInHandler = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Use a synchronous effect and don't call server-only functions from client components.
  useEffect(() => {
    
  }, [session]);



  const navItemClasses =
    "cursor-pointer hover:bg-gray-700/50 rounded-full p-2.5 transition-colors duration-200";

  return (
    <div
      className="
        fixed top-0 left-0 w-full z-50 
        flex justify-center mt-6">
      <div className="rounded-full w-[90%] sm:w-[80%] bg-black/50 backdrop-blur-md border border-gray-700 flex justify-between items-center px-6 py-3 shadow-lg relative z-50">
        {/* Logo */}
        <div>
          <img src="/logo.png" alt="WRDL Logo" className="w-[130px] sm:w-[180px]" />
        </div>

        {/* Navigation */}
        <ul className="flex gap-6 sm:gap-10 text-white text-lg items-center">
          <li className={navItemClasses}>Home</li>
          <li className={navItemClasses}>Rules</li>

          {session ? (
            <div className="relative flex items-center group">
              <Link href={`/${session.user.name}`}>
                <div className="flex items-center gap-3 cursor-pointer rounded-full transition-colors duration-200">
                  <div className="rounded-full border border-blue-400 p-0.5">
                    <img
                      className="rounded-full w-[40px] h-[40px] object-cover"
                      src={profile}
                      alt={session.user.name}
                    />
                  </div>
                  <span className="hidden sm:block text-blue-300 font-semibold">
                    {session.user.email}
                  </span>
                </div>
              </Link>

              <button
                onClick={signInHandler}
                className="absolute right-0 translate-x-[calc(100%+1rem)] sm:relative sm:translate-x-0 
                          bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full
                          opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 
                          transition-all duration-300 ease-in-out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login">
              <li className={`${navItemClasses} px-5`}>Login/Signup</li>
            </Link>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Nav;
