import cron from "node-cron";
import Player from "../../models/playedModel.js";
import { sendNotificationToAdmins } from "./notification.js";

// ✅ احفظ آخر وقت بعتنا فيه notification
let lastSentAt = new Date();

export const startDailySummary = () => {
    cron.schedule("* * * * *", async () => {
        try {
            // ✅ جيب اللاعبين اللي اتضافوا بعد آخر notification بس
            const summary = await Player.aggregate([
                {
                    $match: {
                        createdAt: { $gt: lastSentAt }, // ✅ بعد آخر وقت بعتنا
                    },
                },
                {
                    $group: {
                        _id: "$coach",
                        count: { $sum: 1 },
                        players: {
                            $push: {
                                name: "$name",
                                position: "$position",
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "coach",
                    },
                },
                {
                    $unwind: "$coach",
                },
                {
                    $project: {
                        _id: 0,
                        coachName: "$coach.name",
                        count: 1,
                        players: 1,
                    },
                },
            ]);

            // ✅ لو مفيش لاعبين جدد — متبعتش حاجة
            if (!summary.length) return;

            const totalPlayers = summary.reduce((acc, s) => acc + s.count, 0);

            await sendNotificationToAdmins({
                type: "DAILY_SUMMARY",
                message: `تم إضافة ${totalPlayers} لاعب جديد`,
                details: summary.map((s) => ({
                    coach: s.coachName,
                    count: s.count,
                    players: s.players,
                })),
                createdAt: new Date(),
            });

            // ✅ حدّث الوقت بعد الإرسال بس
            lastSentAt = new Date();

            console.log(`Summary sent: ${totalPlayers} players`);
        } catch (error) {
            console.error("Daily summary error:", error);
        }
    });
};