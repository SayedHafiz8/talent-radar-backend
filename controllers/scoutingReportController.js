import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Player from "../models/playedModel.js";
import ScoutingReport from "../models/scoutingReportModel.js";
import { creating, deleteOne, gettingAll, gettingSpecific, updating } from "../services/services.js";
import AppError from "../utils/appError.js";

export const setPlayerToBody = (req, res, next) => {
    if (!req.body.player) req.body.player = req.params.id;
    next();
};

// @desc    Create scouting report
// @route   POST /api/v1/scouting
// @access  Private - coach only
export const create = creating(ScoutingReport, "coach");

// @desc    Get all scouting reports
// @route   GET /api/v1/scouting
// @access  Private - coach & admin
export const getAll = gettingAll(ScoutingReport, "player");

// @desc    Get specific scouting report
// @route   GET /api/v1/scouting/:id
// @access  Private - coach & admin
export const getSpecific = gettingSpecific(ScoutingReport);

// @desc    Update scouting report
// @route   PATCH /api/v1/scouting/:id
// @access  Private - coach only
export const update = updating(ScoutingReport);

// @desc    Delete scouting report
// @route   DELETE /api/v1/scouting/:id
// @access  Private - admin only
export const deleting = deleteOne(ScoutingReport);

export const checkPlayerOwnership = asyncHandler(async (req, res, next) => {
    if (req.user.role === "admin") return next();

    const player = await Player.collection.findOne(
        { _id: new mongoose.Types.ObjectId(req.params.id) },
        { projection: { coach: 1 } }
    );
    if (!player) {
        return next(new AppError("Player not found", 404));
    }

    if (player.coach.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not allowed to access this player's data", 403));
    }

    next();
});