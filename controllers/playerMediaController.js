import asyncHandler from "express-async-handler";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import tmp from "tmp-promise";
import fs from "fs";

import PlayerMedia from "../models/playerMediaModel.js";
import cloudinary from "../config/cloudinary.js";
import AppError from "../utils/appError.js";
import { gettingAll, gettingSpecific } from "../services/services.js";


ffmpeg.setFfmpegPath(ffmpegInstaller.path);


const MEDIA_SEARCH_FIELDS = ["title", "description"];

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;


const allowedTypes = [
    "video/mp4",
    "image/jpeg",
    "image/png",
    "image/webp"
];



// ============================
// compress image
// ============================

const compressImage = async (inputPath) => {

    const output = await tmp.file({
        postfix: ".jpg"
    });
    await sharp(inputPath)
        .resize({
            width: 1920,
            withoutEnlargement: true
        })
        .jpeg({
            quality: 80
        })
        .toFile(output.path);


    return output.path;
};
// ============================
// compress video
// ============================
const compressVideo = async (inputPath) => {
    const output = await tmp.file({
        postfix: ".mp4"
    });
    await new Promise((resolve, reject)=>{
        ffmpeg(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
            "-crf 30",
            "-preset veryfast",
            "-vf scale=854:-2",
            "-movflags +faststart"
        ])
        .format("mp4")
        .on("end", resolve)
        .on("error", reject)
        .save(output.path);
    });
    return output.path;
};

// ============================
// upload cloudinary
// ============================

const uploadToCloudinary = async (
    filePath,
    isVideo
)=>{


    return await cloudinary.uploader.upload(
        filePath,
        {
            folder:"player-media",
            resource_type:
                isVideo ? "video" : "image",
            timeout:120000,
            ...(!isVideo && {
                quality:"auto:good",
                fetch_format:"auto"
            })
        }
    );
};

export const setPlayerToBody = (
    req,
    res,
    next
)=>{
    req.body.player = req.params.playerId;
    next();
};

export const uploadMedia = asyncHandler(
async(req,res,next)=>{
    if(!req.file){
        return next(
            new AppError(
                "يجب رفع ملف",
                400
            )
        );
    }
    if(!allowedTypes.includes(req.file.mimetype)){
        return next(
            new AppError(
                "نوع الملف غير مسموح",
                400
            )
        );
    }
    const isVideo =
        req.file.mimetype.startsWith("video");
    if(
        isVideo &&
        req.file.size > MAX_VIDEO_SIZE
    ){
        return next(
            new AppError(
                "حجم الفيديو كبير جداً الحد 50MB",
                400
            )
        );
    }

    let finalPath = req.file.path;

    try{
        // ضغط الملف
        if(isVideo){
            finalPath =
                await compressVideo(finalPath);
        }
        else{
            finalPath =
                await compressImage(finalPath);
        }

        const result =
            await uploadToCloudinary(
                finalPath,
                isVideo
            );

        const media =
            await PlayerMedia.create({
                player:req.params.playerId,
                uploadedBy:req.user._id,
                type:
                    isVideo
                    ? "video"
                    : "image",
                url:
                    result.secure_url,
                publicId:
                    result.public_id,
                title:req.body.title,
                description:req.body.description
            });

        res.status(201).json({
            status:"Success",
            data:{
                document:media
            }
        });

    }
    finally{
        // امسح ملف multer الأصلي
        await fs.promises
            .unlink(req.file.path)
            .catch(()=>{});

        // لو finalPath ملف مختلف

        if(finalPath !== req.file.path){

            await fs.promises
                .unlink(finalPath)
                .catch(()=>{});

        }

    }

});

export const getAll =
    gettingAll(
        PlayerMedia,
        "player",
        MEDIA_SEARCH_FIELDS
    );

export const getSpecific =
    gettingSpecific(PlayerMedia);

export const deleteMedia = asyncHandler(
async(req,res,next)=>{
    const media =
        await PlayerMedia.findById(
            req.params.id
        );

    if(!media){
        return next(
            new AppError(
                `No document for this Id: ${req.params.id}`,
                404
            )
        );

    }

    await cloudinary.uploader.destroy(
        media.publicId,
        {

            resource_type:
                media.type === "video"
                ? "video"
                : "image"

        }
    );

    await media.deleteOne();

    res.status(204).json({
        status:"Success"
    });
});