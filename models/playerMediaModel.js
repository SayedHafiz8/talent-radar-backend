import mongoose from "mongoose";

const playerMediaSchema = new mongoose.Schema(
    {
        player: {
            type: mongoose.Schema.ObjectId,
            ref: "Player",
            required: true,
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

playerMediaSchema.index({ player: 1, createdAt: -1 }); // كل ميديا اللاعب مرتبة بالأحدث
playerMediaSchema.index({ player: 1, type: 1 });        // فلترة صور أو فيديوهات
playerMediaSchema.index({
    title:"text",
    description:"text"
});

const PlayerMedia = mongoose.model("PlayerMedia", playerMediaSchema);

export default PlayerMedia;