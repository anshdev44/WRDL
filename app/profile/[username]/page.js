"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { fetchuser } from "../../action/interaction";
import { motion } from "framer-motion";

export default function Page() {
    const { username } = useParams();
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const getUserProfile = async () => {
            try {
                const result = await fetchuser(username);
                const userData = result.user;
                if (userData) {
                    setUserProfile(userData);
                } else {
                    toast.error("User not found");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                toast.error("Failed to load profile");
            }
        };

        getUserProfile();
    }, [username]);

    if (!userProfile) return <p>Loading...</p>;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-[0_0_50px_rgba(168,85,247,0.3)]"
                >
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-50"></div>
                            <img
                                src={
                                    userProfile?.profilepic ||
                                    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                                }
                                alt="Profile"
                                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-purple-500 object-cover shadow-xl"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-4xl font-bold text-white mt-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-white"
                        >
                            {userProfile?.username || "User"}
                        </motion.h1>
                    </div>

                    {/* Profile Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        {/* Email */}
                        <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/50">
                            <p className="text-gray-400 text-sm mb-1">Email</p>
                            <p className="text-white text-lg font-medium">
                                {userProfile?.email || "N/A"}
                            </p>
                        </div>

                        {/* Username */}
                        <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/50">
                            <p className="text-gray-400 text-sm mb-1">
                                Username
                            </p>
                            <p className="text-white text-lg font-medium">
                                {userProfile?.username || "N/A"}
                            </p>
                        </div>

                        {/* Member Since */}
                        <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/50">
                            <p className="text-gray-400 text-sm mb-1">
                                Member Since
                            </p>
                            <p className="text-white text-lg font-medium">
                                {userProfile?.createdAt
                                    ? new Date(
                                          userProfile.createdAt
                                      ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                    : "N/A"}
                            </p>
                        </div>

                        {/* Edit Profile Button */}
                    </motion.div>
                </motion.div>
                <ToastContainer position="bottom-center" theme="dark" />
            </div>
        </>
    );
}
