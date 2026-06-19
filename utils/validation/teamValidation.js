import mongoose from "mongoose";
import { check, body } from "express-validator";

import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import AgeGroup from "../../models/ageGroupModel.js";

export const getSpecificValidate = [
    check('id').isMongoId().withMessage("Invalid Hotel Id"),
    validatorMiddleware
];

export const getAllValidate = [
    check('ageGroup')
        .optional()
        .isMongoId().withMessage('Invalid AgeGroup Id')
        .custom((val) => 
            AgeGroup.findById(val).then((ageGroup) => {
                console.log(ageGroup)
                if(!ageGroup){
                    return Promise.reject(new Error(`No Age for this id: ${val}`))
                }
            })
        ),
    validatorMiddleware
];

export const createValidate = [
    check('name').notEmpty().withMessage("The name is required")
    .isLength({min: 3}).withMessage("The name is too short")
    .isLength({max: 30}).withMessage("The name is too long"),

    check().custom(async (_, { req }) => {
        const ageGroupId = req.body.ageGroup || req.params.id;

        if (!ageGroupId) {
            throw new Error("Team must belong to an ageGroup");
        }

        if (!mongoose.Types.ObjectId.isValid(ageGroupId)) {
            throw new Error("Invalid AgeGroup Id");
        }

        const ageGroup = await AgeGroup.findById(ageGroupId);

        if (!ageGroup) {
            throw new Error(`No AgeGroup for this id: ${ageGroupId}`);
        }

        req.body.ageGroup = ageGroupId;

        return true;
        }),
    
    check('clubName').notEmpty().withMessage("The club name is required"),
    check('coach').notEmpty().withMessage('The Team should have coach'),
    check('coachNumber').optional()
        .isMobilePhone("ar-EG")
        .withMessage("Invalid Egyptian phone number"),
    validatorMiddleware
    
];

export const updateValidate = [
    check('id').isMongoId().withMessage("Invalid Team Id"),
    validatorMiddleware
];

export const deleteValidate = [
    check('id').isMongoId().withMessage("Invalid Team Id"),
    validatorMiddleware
];
