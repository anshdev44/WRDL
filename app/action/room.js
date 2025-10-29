"use server"
import Room from "../models/room";
import connectDB from "../db/connect";
import { fetchuser } from "./interaction";
import { fetchprofilepic } from "./interaction";
import { io } from "socket.io-client";


// const sid=0;


export const CreateNewRoom = async (email, username) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  await connectDB();
  for (let j = 0; j < 1000; j++) {
    let roomID = "";
    for (let i = 0; i < length; i++) {
      roomID += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existingroom = await Room.findOne({ roomID: roomID });
    const res = await fetchprofilepic(email);

    // console.log("Fetched user for room creation:", res.profilepic);
    if (!existingroom) {
      await Room.create({
        roomID,
        players: [{
          username,
          profilepic: res.profilepic,
          email,
          role: "host"
        }]
      });
      // console.log("Room id", roomID);
      return roomID;
    }
  }
  return null;
}



//increment player count
export const incrementplayercount = async (roomID) => {
  await connectDB();
  const room = await Room.findOne({ roomID: roomID });
  if (room) {
    room.playercount = (room.playercount || 0) + 1;
    await room.save();
    return { message: "Player count incremented", status: 200 };
  }
  else {
    return { error: "Room not found", status: 404 };
  }

}

export const getroomdata = async (roomid) => {
  await connectDB();
  const room = await Room.findOne({ roomID: roomid }).lean();
  if (room) {
    room._id = String(room._id);
    return { message: "Room data found", status: 200, room };
  } else {
    return { error: "Room not found", status: 404 };
  }
}

export const handlejoinroombackend = async (roomid, email, username) => {
  await connectDB();
  const exsistingroom = await Room.findOne({ roomID: roomid });
  console.log("Existing room:", exsistingroom);
  if (!exsistingroom) {
    return { error: "Room does not exsits", status: 404 };
  }
  else {
    if (exsistingroom.players.length >= 4) {
      return { error: "Room is full", status: 403 };
    }
    if (exsistingroom.status === "playing") {
      return { error: "Game already started", status: 403 };
    }
    if (exsistingroom.players.find(player => player.email === email)) {
      return { error: "User already in the room", status: 409 };
    }
    const res = await fetchprofilepic(email);
    exsistingroom.players.push({
      username,
      profilepic: res.profilepic,
      email,
      role: "player"
    });
    await exsistingroom.save();
    return { message: "joined thr room", status: 200 };
  }
}

export const leaveroombackend = async (roomid, email) => {
  await connectDB();
  const existingRoom = await Room.findOne({ roomID: roomid });

  if (!existingRoom) {
    return { error: "Room does not exist", status: 404 };
  }
  const playerLeaving = existingRoom.players.find(p => p.email === email);

  if (!playerLeaving) {
    return { error: "Player not found in this room", status: 404 };
  }
  const updatedRoom = await Room.findOneAndUpdate(
    { roomID: roomid },
    { $pull: { players: { email: email } } },
    { new: true }
  );
  if (updatedRoom.players.length === 0) {
    await Room.deleteOne({ roomID: roomid });
    return { message: "Player removed and empty room was deleted.", status: 200 };
  }
  if (playerLeaving.role === 'host') {
    await Room.deleteOne({ roomID: roomid });
    return { message: "Host left the room.", status: 201 };
  }
  return { message: "Player removed successfully.", status: 200,room: updatedRoom};
};