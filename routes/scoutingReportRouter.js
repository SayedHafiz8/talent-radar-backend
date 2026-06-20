import express from "express";

import { create, deleting, getAll, getSpecific, setPlayerToBody, update } from "../controllers/scoutingReportController.js";
import { protect, allowedTo } from "../controllers/authController.js";
import { checkPlayerOwnership, checkReportOwnership } from "../middlewares/ownership.js";
import { createValidate, deleteValidate, getSpecificValidate, updateValidate } from "../utils/validation/scoutingValidation.js";

// mergeParams علشان يشتغل كـ nested route تحت /players/:id/scouting-reports
const scoutingRouter = express.Router({ mergeParams: true });

scoutingRouter
    .route("/")
    .get(protect, allowedTo("coach", "admin"), checkPlayerOwnership, getAll)
    .post(protect, allowedTo("coach"), checkPlayerOwnership, setPlayerToBody, createValidate,create);

scoutingRouter
    .route("/:id")
    .get(protect, allowedTo("coach", "admin"),checkReportOwnership, getSpecificValidate,getSpecific)
    .patch(protect, allowedTo("coach"), checkReportOwnership,updateValidate, update)
    .delete(protect, allowedTo("admin"),deleteValidate, deleting);

export default scoutingRouter;