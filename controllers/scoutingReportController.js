import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Player from "../models/playedModel.js";
import ScoutingReport from "../models/scoutingReportModel.js";
import { creating, deleteOne, gettingAll, gettingSpecific, updating } from "../services/services.js";
import AppError from "../utils/appError.js";

export const setPlayerToBody = (req, res, next) => {
    req.body.player = req.params.playerId;
    next();
};

// @desc    Create scouting report
// @route   POST /api/v1/scouting
// @access  Private - coach only
export const create = creating(ScoutingReport, "coach");

// @desc    Get all scouting reports
// @route   GET /api/v1/scouting
// @access  Private - coach & admin
export const getAll = gettingAll(ScoutingReport, "player", ["notes", "recommendation"]);

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


