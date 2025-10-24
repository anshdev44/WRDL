import mongoose from "mongoose";

const { Schema, model } = mongoose;

const RoomSchema = new Schema({
    roomID: {
        type: String,
        required: true,
        unique: true
    },
    players: {
        type: [
            {
                username: { type: String, required: true },
                profilepic: { type: String  },
                score: { type: Number, default: 0 },
                email: { type: String, required: true },
                role: { type: String, default: "player" }
            }
        ],
        default: [],
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