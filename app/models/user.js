import mongoose from "mongoose";
// ...existing code...
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    email: { type: String, required: true },
    username: { type: String, required: true },
    profilepic: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// ...existing code...
// safe export: avoid reading .models when mongoose is undefined, and reuse existing model if present
const User = mongoose?.models?.User || model("User", UserSchema);

export default User;