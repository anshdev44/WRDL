import mongoose from "mongoose";

const WordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    length: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        default: "general",
    },
});

export default mongoose.models.Word || mongoose.model("Word", WordSchema);
