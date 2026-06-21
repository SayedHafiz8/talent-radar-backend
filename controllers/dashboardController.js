import Player from "../models/playedModel.js";
import ScoutingReport from "../models/scoutingReportModel.js";
import PlayerMedia from "../models/playerMediaModel.js";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import {
    sendNotificationToAdmins,
    sendNotificationToUser,
} from "../socket/handlers/notification.js";

// ============================
// helpers
// ============================
const getAdminDashboardData = async () => {
    const [
        totalPlayers,
        selectedPlayers,
        pendingPlayers,
        rejectedPlayers,
        totalReports,
        totalMedia,
        totalCoaches,
        topCoaches,
    ] = await Promise.all([
        Player.countDocuments(),
        Player.countDocuments({ status: "selected" }),
        Player.countDocuments({ status: "pending" }),
        Player.countDocuments({ status: "rejected" }),
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
    const [
        totalPlayers,
        selectedPlayers,
        pendingPlayers,
        rejectedPlayers,
        totalReports,
    ] = await Promise.all([
        Player.countDocuments({ coach: coachId }),
        Player.countDocuments({ coach: coachId, status: "selected" }),
        Player.countDocuments({ coach: coachId, status: "pending" }),
        Player.countDocuments({ coach: coachId, status: "rejected" }),
        ScoutingReport.countDocuments({ coach: coachId }),
    ]);

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
        status: "Success",
        data,
    });
});

// ============================
// Admin Dashboard العام
// ============================
export const adminDashboard = asyncHandler(async (req, res) => {
    const data = await getAdminDashboardData();

    res.status(200).json({
        status: "Success",
        data,
    });
});

// ============================
// Socket Emitters
// ============================
export const emitAdminDashboardUpdate = async () => {
    try {
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
        const data = await getCoachDashboardData(coachId);
        sendNotificationToUser(coachId.toString(), {
            type: "COACH_DASHBOARD_UPDATE",
            data,
        });
    } catch (error) {
        console.error("Coach dashboard update error:", error);
    }
};