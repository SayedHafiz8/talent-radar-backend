/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
import express from "express";
import { changeLoggedUserPass, forgotPassword, login, logout, protect, refreshToken, resetPassword, signup, updateLoggedUser, verifyResetPassword } from "../controllers/authController.js";
import { singupValidate, loginValidate, updateLoggedUserVal } from "../utils/validation/authValidation.js";
import { changeUserPassword } from "../utils/validation/userValidation.js";


const authRouter = express.Router({mergeParams: true});

authRouter.route('/signup')
            .post(singupValidate,signup);


authRouter.route('/login')
            .post(loginValidate, login);


authRouter.route('/forgotPassword')
            .post(forgotPassword);

authRouter.post('/logout', protect, logout);           
authRouter.post('/refreshToken', refreshToken);

authRouter.route('/verifyResetCode')
            .post(verifyResetPassword);


authRouter.route('/resetPassword')
            .put(resetPassword);


authRouter.route('/changeMyPassword')
            .patch(protect, changeUserPassword, changeLoggedUserPass);

authRouter.route('/updateLoggedUser')
            .patch(protect, updateLoggedUserVal, updateLoggedUser);


export default authRouter;