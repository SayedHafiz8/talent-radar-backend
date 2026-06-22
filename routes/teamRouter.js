import express from "express";
import { getAll, create, getSpecific, deleting, update, setAgeIdToBody } from "../controllers/teamsController.js";
import { createValidate, deleteValidate, getAllValidate, getSpecificValidate, updateValidate } from "../utils/validation/teamValidation.js";
import { protect, allowedTo } from "../controllers/authController.js";
import playerRouter from "./playerRouter.js";
// (mergeParams) using for access parameters on other routers
const teamRouter = express.Router({mergeParams: true});

teamRouter.use('/:id/players', playerRouter);

teamRouter.route('/')
            .get(getAll)
            .post(protect, allowedTo("admin"), setAgeIdToBody, createValidate, create)


teamRouter.route('/:id')
            .get(getSpecificValidate, getSpecific)
            .patch(protect, allowedTo("admin"), updateValidate, update)
            .delete(protect, allowedTo("admin"), deleteValidate, deleting)


export default teamRouter;