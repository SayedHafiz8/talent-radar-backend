import express from "express";
import { changeLoggedUserPass, forgotPassword, login, protect, resetPassword, signup, updateLoggedUser, verifyResetPassword } from "../controllers/authController.js";
import { singupValidate, updateLoggedUserVal } from "../utils/validation/authValidation.js";
import { changeUserPassword } from "../utils/validation/userValidation.js";


const authRouter = express.Router({mergeParams: true});

authRouter.route('/signup')
            .post(singupValidate,signup);


authRouter.route('/login')
            .post(login);


authRouter.route('/forgotPassword')
            .post(forgotPassword);


authRouter.route('/verifyResetCode')
            .post(verifyResetPassword);


authRouter.route('/resetPassword')
            .put(resetPassword);


authRouter.route('/changeMyPassword')
            .patch(protect, changeUserPassword, changeLoggedUserPass);

authRouter.route('/updateLoggedUser')
            .patch(protect, updateLoggedUserVal, updateLoggedUser);
export default authRouter;