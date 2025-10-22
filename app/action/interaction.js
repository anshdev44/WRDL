'use server';
import mongoose from "mongoose";
import User from "../models/user";
import connectDB from "../db/connect";

export const saveprofile = async (data) => {
    await connectDB();
    const currentuser = await User.findOne({ email: data.email }).lean();

    if (currentuser) {
        if (currentuser.pass === data.pass) {
            return { message: "User logged in successfully", status: 200, user: currentuser };
        }
        else {
            return { error: "Incorrect password", status: 401 };
        }
    }

    // create and return a plain object
    const created = await User.create({
        email: data.email,
        username: data.email.split("@")[0],
        pass: data.pass,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const createdObj = created.toObject ? created.toObject() : created;
    createdObj._id = String(createdObj._id);

    return { message: "User created successfully", status: 201, user: createdObj };
}

export const check = async (email) => {
    await connectDB();
    const currentuser = await User.findOne({ email }).lean();

    if (currentuser) {
        return { message: "User exists", status: 200 };
    } else {
        return { error: "User does not exist", status: 404 };
    }
};

export const fetchuser = async (email) => {
    await connectDB();
    const currentuser = await User.findOne({ email }).lean();

    if (currentuser) {
        // log on server (this will appear in your terminal running Next)
        console.log("fetchuser: found user ->", currentuser);
        // ensure id is a string when sending to client
        currentuser._id = String(currentuser._id);
        return { message: "user data found", status: 200, user: currentuser };
    } else {
        return { error: "user cannot be found", status: 404 };
    }
};