import express from "express";
import {
    getCoachDashboard,
    adminDashboard,
} from "../controllers/dashboardController.js";
import { protect, allowedTo } from "../controllers/authController.js";
import { coachIdValidator } from "../utils/validation/dashboardValidation.js";

const dashboardRouter = express.Router();

dashboardRouter.use(protect);

// ✅ الكوتش يشوف داشبورد بتاعه
dashboardRouter.get(
    "/coach",
    allowedTo("coach"),
    getCoachDashboard
);

// ✅ الأدمن يشوف الداشبورد العام
dashboardRouter.get(
    "/admin",
    allowedTo("admin"),
    adminDashboard
);

// ✅ الأدمن يشوف داشبورد كوتش معين
dashboardRouter.get(
    "/admin/:coachId",
    allowedTo("admin"),
    coachIdValidator,
    getCoachDashboard
);

export default dashboardRouter;