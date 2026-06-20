// middlewares/ownership.js
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Player from "../models/playedModel.js";
import ScoutingReport from "../models/scoutingReportModel.js";
import PlayerMedia from "../models/playerMediaModel.js";
import AppError from "../utils/appError.js";

export const checkPlayerOwnership = asyncHandler(async (req, res, next) => {
    if (req.user.role === "admin") return next();

    const player = await Player.findById(req.params.playerId).select("coach");

    if (!player) {
        return next(new AppError("Player not found", 404));
    }

    if (player.coach.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not allowed to access this player's data", 403));
    }

    next();
});

export const checkReportOwnership = asyncHandler(async (req, res, next) => {
    if (req.user.role === "admin") return next();

    const report = await ScoutingReport.findById(req.params.id).select("coach player");

    if (!report) {
        return next(new AppError("Scouting report not found", 404));
    }

    if (report.coach.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not allowed to access this report", 403));
    }
    if ( report.player.toString() !== req.params.playerId) {
        return next(new AppError("This report does not belong to this player", 403));
    }

    next();
});

export const checkMediaOwnership = asyncHandler(async (req, res, next) => {
    if (req.user.role === "admin") return next();

    const media = await PlayerMedia.findById(req.params.id).populate({
        path: "player",
        select: "coach",
    });

    if (!media) {
        return next(new AppError("Media not found", 404));
    }

    if (media.player.coach.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not allowed to access this media", 403));
    }
    if (media.player._id.toString() !== req.params.playerId) {
        return next(new AppError("This media does not belong to this player", 403));
    }

    next();
});