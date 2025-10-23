import mongoose from "mongoose";

const { Schema, model } = mongoose;

const RoomSchema = new Schema({
    roomID: {
        type: String,
        required: true,
        unique: true 
    },
    players: {
        type: Array,
        default: [],
        required: true 
    },
    status: {
        type: String,
        default: "waiting"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

const Room = mongoose?.models?.Room || model("Room", RoomSchema);

export default Room;