"use server"
import Room from "../models/room";
import connectDB from "../db/connect";


export const  createRandomString=async (username)=> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  await connectDB();
  for (let j = 0; j < 1000; j++) {
    let roomID = "";
    for (let i = 0; i < length; i++) {
      roomID += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existingroom = await Room.findOne({ roomID: roomID });
    if (!existingroom) {
      await Room.create({ roomID: roomID, players: [username] });
      console.log("Room id",roomID);
      return roomID;
    }
  }
 return null;
}


//increment player count
export const incrementplayercount=async(roomID)=>{
  await connectDB();
  const room=await Room.find({roomID:roomID});
  if(room){
    room.playercount+=1;
    await room.save();
    return {message:"Player count incremented",status:200};
  }
  else{
    return {error:"Room not found",status:404};
  }

}
