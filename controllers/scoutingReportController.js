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

// @desc    Get player statistics
// @route   GET /api/v1/players/:playerId/reports/statistics
// @access  Private - coach & admin
export const getPlayerStatistics = asyncHandler(async (req, res, next) => {
    const { playerId } = req.params;

    const stats = await ScoutingReport.aggregate([
        // فلتر التقارير بتاعة اللاعب ده بس
        { $match: { player: new mongoose.Types.ObjectId(playerId) } },

        // احسب المتوسطات
        {
            $group: {
                _id: "$player",
                totalReports: { $sum: 1 },
                overallRating: { $avg: "$overallRating" },

                // Technical
                passing:     { $avg: "$technical.passing" },
                dribbling:   { $avg: "$technical.dribbling" },
                shooting:    { $avg: "$technical.shooting" },
                ballControl: { $avg: "$technical.ballControl" },

                // Physical
                speed:    { $avg: "$physical.speed" },
                stamina:  { $avg: "$physical.stamina" },
                strength: { $avg: "$physical.strength" },
                agility:  { $avg: "$physical.agility" },

                // Mental
                positioning:    { $avg: "$mental.positioning" },
                decisionMaking: { $avg: "$mental.decisionMaking" },
                teamwork:       { $avg: "$mental.teamwork" },
                attitude:       { $avg: "$mental.attitude" },

                // اخر تقرير
                lastReport: { $max: "$matchDate" },
            },
        },

        // رتب الـ output
        {
            $project: {
                _id: 0,
                totalReports: 1,
                lastReport: 1,
                overallRating: { $round: ["$overallRating", 2] },
                technical: {
                    passing:     { $round: ["$passing", 2] },
                    dribbling:   { $round: ["$dribbling", 2] },
                    shooting:    { $round: ["$shooting", 2] },
                    ballControl: { $round: ["$ballControl", 2] },
                },
                physical: {
                    speed:    { $round: ["$speed", 2] },
                    stamina:  { $round: ["$stamina", 2] },
                    strength: { $round: ["$strength", 2] },
                    agility:  { $round: ["$agility", 2] },
                },
                mental: {
                    positioning:    { $round: ["$positioning", 2] },
                    decisionMaking: { $round: ["$decisionMaking", 2] },
                    teamwork:       { $round: ["$teamwork", 2] },
                    attitude:       { $round: ["$attitude", 2] },
                },
            },
        },
    ]);

    if (!stats.length) {
        return next(new AppError("No reports found for this player", 404));
    }

    res.status(200).json({
        status: "Success",
        data: {
            statistics: stats[0],
        },
    });
}); 


