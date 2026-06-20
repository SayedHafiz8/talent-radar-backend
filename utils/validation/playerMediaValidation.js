import { body, param } from "express-validator";
import mongoose from "mongoose";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";


// ============================
// Upload Media Validator
// ============================

export const uploadMediaValidator = [
    // Player ID
    param("playerId")
        .notEmpty()
        .withMessage("Player ID is required")
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("Invalid Player ID"),

    // Title
    body("title")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Title must not exceed 100 characters"),

    // Description
    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters"),

    // File validation
    body().custom((_, { req }) => {
        if (!req.file) {
            throw new Error(
                "Media file is required"
            );
        }
        const allowedTypes = [
            "video/mp4",
            "image/jpeg",
            "image/png",
            "image/webp"
        ];
        if (!allowedTypes.includes(req.file.mimetype)) {
            throw new Error(
                "Unsupported file type"
            );
        }
        return true;

    }),



    validatorMiddleware

];

// ============================
// Get / Delete Media Validator
// ============================

export const mediaIdValidator = [

    param("id")
        .notEmpty()
        .withMessage("Media ID is required")
        .custom((value) =>
            mongoose.Types.ObjectId.isValid(value)
        )
        .withMessage("Invalid Media ID"),

    validatorMiddleware

];