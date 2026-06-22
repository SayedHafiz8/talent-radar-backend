/**
 * @swagger
 * /players/{playerId}/media:
 *   post:
 *     summary: Upload player media
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Uploaded successfully
 */
import express from "express";

import {
    uploadMedia,
    getAll,
    getSpecific,
    deleteMedia,
    setPlayerToBody,
} from "../controllers/playerMediaController.js";
import { protect, allowedTo } from "../controllers/authController.js";
import { checkPlayerOwnership, checkMediaOwnership } from "../middlewares/ownership.js";
import upload from "../middlewares/uploadMiddleware.js";
import { mediaIdValidator, uploadMediaValidator } from "../utils/validation/playerMediaValidation.js";

const mediaRouter = express.Router({ mergeParams: true });

mediaRouter
    .route("/")
    .get(protect, allowedTo("coach", "admin"), checkPlayerOwnership, getAll)
    .post(
        protect,
        allowedTo("coach"),
        checkPlayerOwnership,
        upload.single("file"),
        uploadMediaValidator,
        uploadMedia
    );

mediaRouter
    .route("/:id")
    .get(protect, allowedTo("coach", "admin"), mediaIdValidator, checkMediaOwnership, getSpecific)
    .delete(protect, allowedTo("coach", "admin"), mediaIdValidator,checkMediaOwnership, deleteMedia);

export default mediaRouter;