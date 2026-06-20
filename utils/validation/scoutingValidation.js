import { body, param, validationResult } from "express-validator";
import AppError from "../appError.js";

import validatorMiddleware from "../../middlewares/validatorMiddleware.js";

const technicalFields = ["passing", "dribbling", "shooting", "ballControl"];
const physicalFields = ["speed", "stamina", "strength", "agility"];
const mentalFields = ["positioning", "decisionMaking", "teamwork", "attitude"];

// rating field (1 -> 10) - مطلوبة (للـ create)
const requiredRating = (path) =>
    body(path)
        .notEmpty()
        .withMessage(`${path} is required`)
        .bail()
        .isInt({ min: 1, max: 10 })
        .withMessage(`${path} must be a number between 1 and 10`);

// rating field (1 -> 10) - اختيارية (للـ update)
const optionalRating = (path) =>
    body(path)
        .optional()
        .isFloat({ min: 1, max: 10 })
        .withMessage(`${path} must be a number between 1 and 10`);

// فيلد ممنوع يتبعت من العميل خالص (بيتحدد من السيرفر بس)
const lockField = (field) =>
    body(field)
        .not()
        .exists()
        .withMessage(`${field} cannot be set manually`);

// @desc    Validate create scouting report
// @route   POST /api/v1/players/:id/scouting-reports
export const createValidate = [
    lockField('player'),

    body("matchDate")
        .notEmpty()
        .withMessage("matchDate is required")
        .bail()
        .isISO8601()
        .withMessage("matchDate must be a valid date")
        .toDate(),

    ...technicalFields.map((field) => requiredRating(`technical.${field}`)),
    ...physicalFields.map((field) => requiredRating(`physical.${field}`)),
    ...mentalFields.map((field) => requiredRating(`mental.${field}`)),

    body("recommendation")
        .notEmpty()
        .withMessage("recommendation is required")
        .bail()
        .isIn(["promote", "continue", "review"])
        .withMessage("recommendation must be one of: promote, continue, review"),

    body("notes")
        .optional()
        .isString()
        .withMessage("notes must be text")
        .isLength({ max: 1000 })
        .withMessage("notes must be less than 1000 characters"),

    body("matchDate")
        .custom((value) => {
            if (new Date(value) > new Date()) {
                throw new Error("matchDate cannot be in the future");
            }
            return true;
        }),

    // الـ coach والـ overallRating بيتحددوا من السيرفر (middleware) مش من العميل
    lockField("coach"),
    lockField("overallRating"),

    validatorMiddleware,
];

// @desc    Validate update scouting report
// @route   PATCH /api/v1/scouting/:id
export const updateValidate = [
    param("playerId").isMongoId().withMessage("Invalid player id"),

    body("matchDate")
        .optional()
        .isISO8601()
        .withMessage("matchDate must be a valid date")
        .toDate(),

    ...technicalFields.map((field) => optionalRating(`technical.${field}`)),
    ...physicalFields.map((field) => optionalRating(`physical.${field}`)),
    ...mentalFields.map((field) => optionalRating(`mental.${field}`)),

    body("recommendation")
        .optional()
        .isIn(["promote", "continue", "review"])
        .withMessage("recommendation must be one of: promote, continue, review"),

    body("notes")
        .optional()
        .isString()
        .withMessage("notes must be text")
        .isLength({ max: 1000 })
        .withMessage("notes must be less than 1000 characters"),

    // ممنوع تتغير ملكية التقرير أو الـ overallRating بعد إنشاءه
    lockField("coach"),
    lockField("player"),
    lockField("overallRating"),

    validatorMiddleware,
];

// @desc    Validate get specific scouting report
// @route   GET /api/v1/scouting/:id
export const getSpecificValidate = [
    param("PlayerId").isMongoId().withMessage("Invalid player id"),
    validatorMiddleware,
];

// @desc    Validate delete scouting report
// @route   DELETE /api/v1/scouting/:id
export const deleteValidate = [
    param("PlayerId").isMongoId().withMessage("Invalid player id"),
    validatorMiddleware,
];