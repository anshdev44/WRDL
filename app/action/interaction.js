"use server";
import mongoose from "mongoose";
import User from "../models/user";
import connectDB from "../db/connect";

export const saveprofile = async (data) => {
    await connectDB();
    const currentuser = await User.findOne({ email: data.email }).lean();

    if (currentuser) {
        if (currentuser.pass === data.pass) {
            return {
                message: "User logged in successfully",
                status: 200,
                user: currentuser,
            };
        } else {
            return { error: "Incorrect password", status: 401 };
        }
    }

    const created = await User.create({
        email: data.email,
        username: data.email.split("@")[0],
        pass: data.pass,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const createdObj = created.toObject ? created.toObject() : created;
    createdObj._id = String(createdObj._id);

    return {
        message: "User created successfully",
        status: 201,
        user: createdObj,
    };
};

// used for checking if user exsists befor going to profile page
export const check = async (email) => {
    await connectDB();
    const currentuser = await User.findOne({ email }).lean();

    if (currentuser) {
        return { message: "User exists", status: 200 };
    } else {
        return { error: "User does not exist", status: 404 };
    }
};

export const fetchuser = async (identifier) => {
    await connectDB();

    const isEmail = identifier.includes("@");
    const query = isEmail ? { email: identifier } : { username: identifier };

    const currentuser = await User.findOne(query).lean();

    if (currentuser) {
        // console.log("fetchuser: found user ->", currentuser);

        currentuser._id = String(currentuser._id);
        return { message: "user data found", status: 200, user: currentuser };
    } else {
        return { error: "user cannot be found", status: 404 };
    }
};

export const updateuser = async (data) => {
    await connectDB();
    const currentuser = await User.findOne({ email: data.email }).lean();

    if (currentuser) {
        const checkusername = await User.findOne({
            email: data.email,
            username: data.username,
        });
        if (checkusername) {
            const checkusernameandemailaresame = await User.findOne({
                email: data.email,
                username: data.username,
            });
            if (!checkusernameandemailaresame) {
                return { error: "username already exsits", status: 409 };
            } else {
                await User.updateOne({ email: data.email }),
                    {
                        $set: {
                            profilepic: data.profilepic,
                            updatedAt: new Date(),
                        },
                    };
            }
        }
        const updateuser = await User.updateOne(
            { email: data.email },
            {
                $set: {
                    username: data.username,
                    profilepic: data.profilepic,
                    updatedAt: new Date(),
                },
            }
        );
        return { message: "user updated successfully", status: 200 };
    } else {
        return { error: "user does not exsits", status: 404 };
    }
};

export const fetchprofilepic = async (email) => {
    await connectDB();
    const currentuser = await User.findOne({ email }).lean();
    if (currentuser) {
        return {
            message: "profile pic fetched",
            status: 200,
            profilepic: currentuser.profilepic,
        };
    } else {
        return { error: "user does not exsits", status: 404 };
    }
};
