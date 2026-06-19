import express from "express";
import { getAll, create, getSpecific, deleting, update, setUserIdToBody } from "../controllers/playerController.js";
import { createValidate } from "../utils/validation/playerValidation.js";
import { allowedTo, protect } from "../controllers/authController.js";

// (mergeParams) using for access parameters on other routers
const playerRouter = express.Router({mergeParams: true});

playerRouter.route('/')
            .get(protect, allowedTo("coach", "admin"), getAll)
            .post(protect,allowedTo("coach"),setUserIdToBody, createValidate,create)


playerRouter.route('/:id')
            .get(getSpecific)
            .patch(update)
            .delete(deleting)


export default playerRouter;