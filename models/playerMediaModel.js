import mongoose from "mongoose";

const playerMediaSchema = new mongoose.Schema(
    {
        player: {
            type: mongoose.Schema.ObjectId,
            ref: "Player",
            required: true,
            index: true, // هتفلتر بيه كتير: "كل ميديا اللاعب ده"
        },
        uploadedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const PlayerMedia = mongoose.model("PlayerMedia", playerMediaSchema);

export default PlayerMedia;