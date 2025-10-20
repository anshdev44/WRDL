"use server";
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import connectDB from "../../../db/connect.js";
// import mongoose from "mongoose";
import User from "../../../models/user";
import GoogleProvider from "next-auth/providers/google";

await connectDB();

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
  callbacks: {
    async signIn({ user, account }) {
      const isAllowedToSignIn = true;
      const email = user.email;
      // console.log(email);

      if ((account.provider === "github" || account.provider === "google") && email) {
        // console.log("account provider:", account.provider);
        let currentUser = await User.findOne({ email });
        // console.log("currentUser:", currentUser);
        if (!currentUser) {
          const newUser = await new User({
            email,
            username: email.split("@")[0],
          }).save();
          user.name = newUser.username;
        } else {
          user.name = currentUser.username;
        }
      }

      return isAllowedToSignIn;
    },
  }
});

export { handler as GET, handler as POST };