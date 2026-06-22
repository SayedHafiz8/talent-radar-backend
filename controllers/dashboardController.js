import mongoose from "mongoose";
import Player from "../models/playedModel.js";
import ScoutingReport from "../models/scoutingReportModel.js";
import PlayerMedia from "../models/playerMediaModel.js";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import {
    sendNotificationToAdmins,
    sendNotificationToUser,
} from "../socket/handlers/notification.js";
import { getConnectedUsers } from "../socket/index.js";

// ============================
// helpers
// ============================
const getAdminDashboardData = async () => {
    // 4 countDocuments دُمجت في aggregate واحد (4 round-trips → 1)
    const [
        playerStats,
        totalReports,
        totalMedia,
        totalCoaches,
        topCoaches,
    ] = await Promise.all([
        Player.aggregate([
            {
                $facet: {
                    byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
                    total:    [{ $count: "count" }],
                },
            },
        ]),
        ScoutingReport.countDocuments(),
        PlayerMedia.countDocuments(),
        User.countDocuments({ role: "coach" }),
        Player.aggregate([
            { $match: { status: "selected" } },
            { $group: { _id: "$coach", selectedPlayers: { $sum: 1 } } },
            { $sort: { selectedPlayers: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "coach",
                },
            },
            { $unwind: "$coach" },
            {
                $project: {
                    _id: 0,
                    coachName: "$coach.name",
                    selectedPlayers: 1,
                },
            },
        ]),
    ]);

    const facet = playerStats[0];
    const statusMap = {};
    facet.byStatus.forEach((s) => { statusMap[s._id] = s.count; });

    const totalPlayers    = facet.total[0]?.count    ?? 0;
    const selectedPlayers = statusMap["selected"]    ?? 0;
    const pendingPlayers  = statusMap["pending"]     ?? 0;
    const rejectedPlayers = statusMap["rejected"]    ?? 0;

    return {
        totalPlayers,
        selectedPlayers,
        pendingPlayers,
        rejectedPlayers,
        totalReports,
        totalMedia,
        totalCoaches,
        topCoaches,
        selectionRate:
            totalPlayers === 0
                ? 0
                : Number((selectedPlayers / totalPlayers) * 100).toFixed(2),
    };
};

const getCoachDashboardData = async (coachId) => {
    // 4 countDocuments دُمجت في aggregate واحد (4 round-trips → 1)
    const [playerStats, totalReports] = await Promise.all([
        Player.aggregate([
            { $match: { coach: new mongoose.Types.ObjectId(coachId) } },
            {
                $facet: {
                    byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
                    total:    [{ $count: "count" }],
                },
            },
        ]),
        ScoutingReport.countDocuments({ coach: coachId }),
    ]);

    const facet = playerStats[0];
    const statusMap = {};
    facet.byStatus.forEach((s) => { statusMap[s._id] = s.count; });

    const totalPlayers    = facet.total[0]?.count    ?? 0;
    const selectedPlayers = statusMap["selected"]    ?? 0;
    const pendingPlayers  = statusMap["pending"]     ?? 0;
    const rejectedPlayers = statusMap["rejected"]    ?? 0;

    return {
        totalPlayers,
        selectedPlayers,
        pendingPlayers,
        rejectedPlayers,
        totalReports,
        selectionRate:
            totalPlayers === 0
                ? 0
                : Number((selectedPlayers / totalPlayers) * 100).toFixed(2),
    };
};

// ============================
// Coach Dashboard
// ✅ الكوتش يشوف بتاعه — الأدمن يشوف كوتش معين
// ============================
export const getCoachDashboard = asyncHandler(async (req, res, next) => {
    const coachId =
        req.user.role === "admin"
            ? req.params.coachId  // ✅ الأدمن بيمرر coachId في الـ params
            : req.user._id;       // ✅ الكوتش بياخد id بتاعه تلقائي

    const data = await getCoachDashboardData(coachId);

    res.status(200).json({
        status: "success",
        data,
    });
});

// ============================
// Admin Dashboard العام
// ============================
export const adminDashboard = asyncHandler(async (req, res) => {
    const data = await getAdminDashboardData();

    res.status(200).json({
        status: "success",
        data,
    });
});

// ============================
// Socket Emitters
// ============================
export const emitAdminDashboardUpdate = async () => {
    try {
        // تجنب الـ aggregation لو ما في حد متصل أصلاً
        if (getConnectedUsers().size === 0) return;
        const data = await getAdminDashboardData();
        await sendNotificationToAdmins({
            type: "ADMIN_DASHBOARD_UPDATE",
            data,
        });
    } catch (error) {
        console.error("Admin dashboard update error:", error);
    }
};

export const emitCoachDashboardUpdate = async (coachId) => {
    try {
        // تجنب الـ aggregation لو الـ coach أوفلاين
        if (!getConnectedUsers().get(coachId.toString())) return;
        const data = await getCoachDashboardData(coachId);
        sendNotificationToUser(coachId.toString(), {
            type: "COACH_DASHBOARD_UPDATE",
            data,
        });
    } catch (error) {
        console.error("Coach dashboard update error:", error);
    }
};