import express from "express";
import { getAll, create, getSpecific, deleting, update, setTeamIdToBody, restore, softDele, changePassword } from "../controllers/userController.js";
import { createValidate, deleteValidate, getSpecificValidate, updateValidate, changeUserPassword } from "../utils/validation/userValidation.js";
import playerRouter from "./playerRouter.js";
import { allowedTo, protect } from "../controllers/authController.js";


const userRouter = express.Router({mergeParams: true});

userRouter.use('/:id/players', playerRouter)

userRouter.route('/')
            .get(protect, allowedTo('admin'), getAll)
            .post(protect, allowedTo('admin'),createValidate,create)


userRouter.route('/:id')
            .get(protect, allowedTo('admin'),getSpecificValidate, getSpecific)
            .patch(protect, allowedTo('admin'),updateValidate, update)
            .delete(protect, allowedTo('admin'),deleteValidate, softDele)

userRouter.patch("/:id/changePassword",protect, allowedTo('admin'),changeUserPassword,changePassword)


userRouter.route("/:id/force")
            .delete(protect, allowedTo('admin'),deleteValidate, deleting)


userRouter.route('/:id/restore')
            .patch(protect, allowedTo('admin'),restore)

export default userRouter;