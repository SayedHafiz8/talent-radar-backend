import mongoose from "mongoose";
import { check, body } from "express-validator";

import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import Team from "../../models/teamModel.js";
import Player from "../../models/playedModel.js";

export const getSpecificValidate = [
    check('id').isMongoId().withMessage("Invalid Player Id"),
    validatorMiddleware
];

export const getAllValidate = [
    check('team')
        .optional()
        .isMongoId().withMessage('Invalid Team Id')
        .custom((val) => 
            Hotel.findById(val).then((team) => {
                console.log(team)
                if(!team){
                    return Promise.reject(new Error(`No team for this id: ${val}`))
                }
            })
        ),
    validatorMiddleware
];

export const createValidate = [
    check('name').notEmpty().withMessage('Name Is Required')
        .isLength({min: 3}).withMessage("The name is too short"),
    

    check('dateOfBirth').notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format'),

    
    
    check('city').notEmpty().withMessage("The city of the player is required"),
    check('address').notEmpty().withMessage('Address is required'),
    check('phoneNumber').notEmpty().withMessage('please Enter the player phone number')
        .matches(/^01[0125][0-9]{8}$/)
        .withMessage('Invalid Egyptian phone number'),

    check('preferredFoot').notEmpty().withMessage("Eneter the preferd foot of the player (Reight - Left)"),
    check('height').notEmpty().withMessage("Enter the height of the player").isNumeric(),
    check('weight').notEmpty().withMessage("Enter the weight of the player").isNumeric(),
    check('jerseyNum').notEmpty().withMessage("Enter The player T-shirt number").isNumeric(),
    check('position').notEmpty().withMessage("Enter the position of the player"),
    validatorMiddleware
    
];

export const updateValidate = [
    check('id').isMongoId().withMessage("Invalid Player Id"),
    body()
        .custom((value, { req }) => {
            if (Object.keys(req.body).length === 0) {
                throw new Error("Please provide at least one field to update");
            }
            return true;
        }),
    body()
        .custom((value, { req }) => {

            const validFields = Object.values(req.body).filter(
                val => val !== "" && val !== null
            );

            if (validFields.length === 0) {
                throw new Error("Please provide valid data to update");
            }

            return true;
        }),
    validatorMiddleware
];

export const deleteValidate = [
    check('id').isMongoId().withMessage("Invalid player Id"),
    validatorMiddleware
];
