import express from "express";
import { create, getAll, getSpecific } from "../controllers/agesController.js";
import { getAgeValidator, createValidator, deleteValidator, updateValidator } from "../utils/validation/agesValidation.js";
import { protect, allowedTo } from "../controllers/authController.js";
import teamRouter from "./teamrouter.js";

const ageRouter = express.Router();

// Using nested routes
ageRouter.use('/:id/teams', teamRouter);

ageRouter.route('/')
            .post(protect, allowedTo("admin"), createValidator, create)
            .get(getAll)


ageRouter.route('/:id')
            .get(getSpecific)
            



export default ageRouter;