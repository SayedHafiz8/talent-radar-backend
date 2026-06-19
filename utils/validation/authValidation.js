import mongoose from "mongoose";
import { check, body } from "express-validator";
import bcrypt from "bcryptjs";

import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import User from "../../models/userModel.js";




export const singupValidate = [
    check('name').notEmpty().withMessage('Name Is Required')
        .isLength({min: 3}).withMessage("The name is too short")
        ,
    

    check('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid Email format')
    .custom(async (val) => {
        const user = await User.findOne({ email: val });

        if (user) {
            throw new Error("email already exists");
        }

        return true;
    }),

    check('password').notEmpty().withMessage('Password is required')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
        .withMessage("Password must be at least 8 characters and include uppercase, lowercase and number"),


    check('passwordConfirm').notEmpty().withMessage("Password confimation is required")
        .custom((password, {req}) => {
            if (password != req.body.password){
                throw new Error('Password Confirmation incorrect')
            }
            return true;
        }),



    validatorMiddleware
    
];

export const loginValidate = [
    
    check('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid Email format'),

    check('password').notEmpty().withMessage('Password is required')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
        .withMessage("Password must be at least 8 characters and include uppercase, lowercase and number"),


    validatorMiddleware
    
];

export const updateLoggedUserVal = [
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
    check('name').optional()
        .isLength({min: 3}).withMessage("The name is too short")
        ,
    

    check('email').optional()
    .isEmail().withMessage('Invalid Email format')
    .custom(async (val) => {
        const user = await User.findOne({ email: val });

        if (user) {
            throw new Error("email already exists");
        }

        return true;
    }),
    check('phoneNumber').optional()
        .matches(/^01[0125][0-9]{8}$/)
        .withMessage('Invalid Egyptian phone number'),
    validatorMiddleware
];


