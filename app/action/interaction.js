'use server';
import mongoose from "mongoose";
import User from "../models/user";
import connectDB from "../db/connect";

export const saveprofile = async (data) => {
    await connectDB();
    // use .lean() so Mongoose returns a plain JS object that can be safely sent to the client
    const currentuser = await User.findOne({ email: data.email }).lean();

    if (currentuser) {
        // ensure id is a string (ObjectId -> string)
        return { ...currentuser, _id: String(currentuser._id) };    
    }

    // create a plain object and save with the model, then return a serializable object
    const newUserData = {
        email: data.email,
        username: data.email.split("@")[0],
        pass: data.pass,
    }.save();

    const created = await User.create(newUserData);

    // created is a Mongoose document; convert to plain object
    const createdObj = created.toObject ? created.toObject() : created;
    createdObj._id = String(createdObj._id);

    return { message: "User created successfully", status: 201, user: createdObj };
}