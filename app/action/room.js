import Room from "../models/room";
import connectDB from "../db/connect";

export const joinroom =async (roomID,playerID)=>{
 await connectDB();
 const checkroom=await Room.findOne({roomID:roomID}).lean();
 if(checkroom){
   if(checkroom.players.length>=4){
    return {error:"Room is Full",status:403};
   }
   if(checkroom.players.includes(playerID)){
    return {message:"PLayer already in room",status:402}
   }
   if(checkroom.status==="in-progress" || checkroom.status==="ended"){
    return {error:"Game already started",status:405};
   }
   return {message:"Room Found",status:200,room:checkroom};
 }
 else{
    return {error:"Room Not Found",status:404};
 }
}