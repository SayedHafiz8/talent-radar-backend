

import express from "express";
import { getAll, create, getSpecific, deleting, update, setUserIdToBody, updatePlayerStatus } from "../controllers/playerController.js";
import { createValidate, getAllValidate, deleteValidate, getSpecificValidate, updateValidate, updatePlayerStatusValidator } from "../utils/validation/playerValidation.js";
import { allowedTo, protect } from "../controllers/authController.js";
import scoutingRouter from "./scoutingReportRouter.js";
import mediaRouter from "./playerMediaRouter.js";

// (mergeParams) using for access parameters on other routers
const playerRouter = express.Router({mergeParams: true});

playerRouter.use('/:playerId/reports', scoutingRouter);
playerRouter.use('/:playerId/media', mediaRouter)

playerRouter.route('/')
            .get(protect, allowedTo("coach", "admin"),getAllValidate ,getAll)
            .post(protect,allowedTo("coach"),setUserIdToBody, createValidate,create)


playerRouter.route('/:id')
            .get(protect, allowedTo("coach", "admin"), getSpecificValidate, getSpecific)
            .patch(protect, allowedTo("coach"), updateValidate, update)
            .delete(protect, allowedTo("coach"), deleteValidate, deleting)

playerRouter.route('/:id/status')
            .patch(protect,allowedTo('admin'), updatePlayerStatusValidator, updatePlayerStatus)
export default playerRouter;