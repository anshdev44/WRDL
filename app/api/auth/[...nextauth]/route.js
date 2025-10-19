"use server";
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import connectjs from "../../../db/connect.js";
// import mongoose from "mongoose";
// import User from "../../../models/user";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,   
    }),
    
  ],
  callbacks:{
   
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };