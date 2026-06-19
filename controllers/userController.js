import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

import User from "../models/userModel.js";
import { creating, deleteOne, gettingAll, gettingSpecific, restoring, softDelete, updating } from "../services/services.js";
import AppError from "../utils/appError.js";



export const setTeamIdToBody = (req, res, next) => {
    // Nested Router
    if(!req.body.team) req.body.team = req.params.id;
    next();
}

// @desc    Create new User
// @route   POST api/v1/users
// @access  private
export const create = creating(User); 

// @desc    Get all Users
// @route   POST api/v1/users
// @access  private
export const getAll = gettingAll(User);

// @desc    Get specific User 
// @route   POST api/v1/users/:id
// @access  private
export const getSpecific = gettingSpecific(User);

// @desc    Delete specific User 
// @route   POST api/v1/users/:id/force
// @access  private
export const deleting = deleteOne(User);

// @desc    Update specific User 
// @route   POST api/v1/users/:id
// @access  private
export const update = asyncHandler(async (req, res ,next) => {
    const id = req.params.id;
    const document = await User.findByIdAndUpdate(id,
        {
            name: req.body.name,
            role: req.body.role,
            profileImg: req.body.profileImg,
            phoneNumber: req.body.phoneNumber
        },
        {returnDocument :"after", runValidators: true}
    )
    
    if(!document){
        return next(new AppError(`No model for This Id: ${id}`,404))
    }
    res.status(200).json({
        status: "Success",
        data: {
            document
        }
    })
});

// @desc    Change password specific User 
// @route   DELTE api/v1/users/:id/changePassword
// @access  private
export const changePassword = asyncHandler(async (req, res ,next) => {
    const id = req.params.id;
    const document = await User.findByIdAndUpdate(id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now()
        },
        {returnDocument :"after", runValidators: true}
    )
    
    if(!document){
        return next(new AppError(`No model for This Id: ${id}`, 404));
    }
    res.status(200).json({
        status: "Success",
        data: {
            document
        }
    })
});


// @desc    Soft Delete specific User 
// @route   DELTE api/v1/users/:id
// @access  private
export const softDele = softDelete(User);

// @desc    restore specific User 
// @route   PATCH api/v1/users/:id/restore
// @access  private
export const restore = restoring(User);