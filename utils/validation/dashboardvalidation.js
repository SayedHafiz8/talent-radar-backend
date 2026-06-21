import { param } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import User from "../../models/userModel.js";

export const coachIdValidator = [
    param("coachId")
        .isMongoId()
        .withMessage("Invalid coach id")
        .custom(async (val) => {
            const coach = await User.findById(val);
            if (!coach) throw new Error("Coach not found");
            if (coach.role !== "coach") throw new Error("This user is not a coach");
            return true;
        }),
    validatorMiddleware,
];