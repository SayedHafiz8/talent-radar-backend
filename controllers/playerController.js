import asyncHandler from "express-async-handler";

import Player from "../models/playedModel.js";
import AppError from "../utils/appError.js";
import { creating, deleteOne, gettingAll, gettingSpecific, updating } from "../services/services.js";
import { sendNotificationToUser, sendNotificationToAdmins } from "../socket/handlers/notification.js";
import {
    emitAdminDashboardUpdate,
    emitCoachDashboardUpdate,
} from "./dashboardController.js";



export const setUserIdToBody = (req, res, next) => {
    // Nested Router
    if(!req.body.coach) req.body.coach = req.params.id;
    next();
}

// @desc    Create new AgeGroup
// @route   POST api/v1/ages
// @access  private
export const create = asyncHandler(async (req, res, next) => {
    req.body.coach = req.user._id;

    const player = await Player.create(req.body);

    // fire-and-forget — الـ response لا ينتظر الـ dashboard update
    emitAdminDashboardUpdate();
    res.status(201).json({
        status: "success",
        data: { document: player },
    });
});

// @desc    Get all age groups
// @route   POST api/v1/ages
// @access  private
export const getAll = gettingAll(Player, "coach", ["name", "position", "preferredFoot", "nationality", "city"]);

// @desc    Get specific age 
// @route   POST api/v1/ages/:id
// @access  private
export const getSpecific = gettingSpecific(Player);

// @desc    Get specific age 
// @route   POST api/v1/ages/:id
// @access  private
export const deleting = deleteOne(Player);

//@desc    Get specific age 
// @route   POST api/v1/ages/:id
// @access  private
export const update = updating(Player);

export const updatePlayerStatus = asyncHandler(async (req, res, next) => {
    const player = await Player.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
    );

    if (!player) {
        return next(new AppError("Player not found", 404));
    }

    // fire-and-forget — الـ response لا ينتظر الـ dashboard updates
    emitAdminDashboardUpdate();
    emitCoachDashboardUpdate(player.coach);

    sendNotificationToUser(player.coach.toString(), {
        type: "PLAYER_STATUS_UPDATED",
        message: `The status of the player '${player.name}' to "${req.body.status}"`,
        player: {
            id: player._id,
            name: player.name,
            status: player.status,
        },
        createdAt: new Date(),
    });

    res.status(200).json({
        status: "success",
        data: { player },
    });
});