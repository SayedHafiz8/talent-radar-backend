import express from "express";

import { checkPlayerOwnership, create, deleting, getAll, getSpecific, setPlayerToBody, update } from "../controllers/scoutingReportController.js";
import { protect, allowedTo } from "../controllers/authController.js";
//import { createValidate, updateValidate, getSpecificValidate, deleteValidate } from "../utils/validation/scoutingValidation.js";

// mergeParams علشان يشتغل كـ nested route تحت /players/:id/scouting-reports
const scoutingRouter = express.Router({ mergeParams: true });

scoutingRouter
    .route("/")
    .get(protect, allowedTo("coach", "admin"), checkPlayerOwnership, getAll)
    .post(protect, allowedTo("coach"), checkPlayerOwnership, setPlayerToBody, create);

scoutingRouter
    .route("/:id")
    .get(protect, allowedTo("coach", "admin"), getSpecific)
    .patch(protect, allowedTo("coach"), update)
    .delete(protect, allowedTo("admin"), deleting);

export default scoutingRouter;