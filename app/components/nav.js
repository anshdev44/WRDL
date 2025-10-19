"use client"
import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from "next/link";

const Nav = () => {
    const { data: session } = useSession();

    // --- Tailwind Classes for common button styles ---
    const navItemClasses = 'cursor-pointer hover:bg-gray-700/50 rounded-full p-2.5 transition-colors duration-200';

    return (
        <div className='flex mt-10 justify-center'>
            <div className='rounded-full border  w-[80%] h-25 flex justify-between items-center p-5'>

                {/* Logo Area */}
                <div>
                    {/* Assuming '/logo.png' is your WRDL logo */}
                    <img src='/logo.png' alt='WRDL Logo' className='w-[150px] sm:w-[200px]' />
                </div>

                {/* Navigation and Auth Area */}
                <div>
                    <ul className='flex gap-4 sm:gap-10 text-white text-lg items-center justify-center'>

                        {/* Nav Links */}
                        <li className={navItemClasses}>Home</li>
                        <li className={navItemClasses}>Rules</li>

                        {/* Conditional Rendering for Auth */}
                        {session ? (

                            // *** START: The Hover Container ***
                            <div className='relative flex items-center group'>

                                {/* 1. The Main Hover Area (Avatar and Email) */}
                                <div className='flex justify-center items-center gap-4 p-2 cursor-pointer rounded-full transition-colors duration-200'>
                                    <div className='rounded-full border border-blue-400 p-0.5'>
                                        <img
                                            className='rounded-full w-[40px] h-[40px] object-cover'
                                            src={session.user.image}
                                            alt={session.user.name}
                                        />
                                    </div>
                                    <span className='hidden sm:block text-blue-300 font-semibold'>{session.user.email}</span>
                                </div>

                                {/* 2. The Hidden Sign Out Button (Revealed on Group Hover) */}
                                <button
                                    onClick={() => signOut()}
                                    className='absolute right-0 translate-x-[calc(100%+1rem)] sm:relative sm:translate-x-0 
                                               bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full
                                               opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 
                                               w-auto transition-all duration-300 ease-in-out'
                                >
                                    Sign Out
                                </button>
                            </div>
                            // *** END: The Hover Container ***

                        ) : (
                            // Logged Out State
                            <>
                                <Link href="/login" >
                                    <li
                                        className={`${navItemClasses}  px-5`}
                                    >
                                        Login/Signup
                                    </li>
                                </Link>

                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Nav;