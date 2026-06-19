import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import crypto from "crypto"

import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";

export const signup = asyncHandler(async(req, res, next)=>{
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRE_TIME});

    res.status(201).json({
        status: "Success",
        data: {
            user,
            token
        }
    })
})

export const login = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user || !await bcrypt.compare(req.body.password, user.password)){
        return next(new AppError('Incorrect email or password'));
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRE_TIME});

    res.status(201).json({
        status: "Success",
        data: {
            user,
            token
        }
    })
})

export const protect = asyncHandler(async(req,res, next) => {
    // 1) Check if token exist
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token){
        return next(new AppError("You are not login, please login first", 401));
    }

    // 2) Verify token (no change happens, expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // 3) check if user exist
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
        return next(new AppError("The user that belong to this token does no longer exist", 401));
    }

    // 4) check if user ghanged password after token created
    if (currentUser.passwordChangedAt) {
        const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000);
        if (passChangedTimestamp > decoded.iat) {
            return next(new AppError("User recently changed his password, please login again..", 401));
        }
    }

    req.user = currentUser;
    next();
})

export const allowedTo = (...roles) => {
    return asyncHandler(async(req, res, next) => {
        
        if(!roles.includes(req.user.role)) {
            return next(new AppError("You are not allowed to access this route", 403));
        }
        next();
    })
}

export const forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new AppError(`There is no user with this email ${req.body.email}`));
    }



    // Generate random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code
    const hashedResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");

    // Save hashed pass reset code in db
    user.passwordResetCode = hashedResetCode;

    // add expiration time for pass reset code (10)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    user.passwordResetVerified = false;

    user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your reset password',
            message: `
                <h2>TalentRader</h2>
                <p>Hi ${user.name}</p>
                <p>Your reset password code is:</p>
                <h1>${resetCode}</h1>
                <p>This code is valid for 10 minutes.</p>
            `
        });
    } catch (error) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;

        await user.save();

        return next(new AppError('There is an error in sending email', 500));
    }

    res.status(200).json({
        status: "success", 
        message: 'Reset code send to email'
    })
})

export const verifyResetPassword = asyncHandler(async(req, res, next) => {
    // 1) get user based on reset code
    const hashedResetCode = crypto
        .createHash("sha256")
        .update(req.body.resetCode)
        .digest("hex");

    const user = await User.findOne({
        passwordResetCode: hashedResetCode,
        passwordResetExpires: {$gt: Date.now()}
    });

    if(!user){
        return next(new AppError('Reset code invalid or expired', 400))
    }

    user.passwordResetVerified = true;

    await user.save();

    res.status(200).json({
        status: "success"
    });
});

export const resetPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return next(new AppError(`There is no user with email ${req.body.email}`, 404));
    }

    if(!user.passwordResetVerified) {
        return next(new AppError('Reset password not verified', 400));
    }

    user.password = req.body.newPassword;
    user.passwordResetVerified = undefined;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRE_TIME});

    res.status(201).json({data:{token}})
});

export const changeLoggedUserPass = asyncHandler(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now()
        },
        {returnDocument :"after", runValidators: true}
    )
    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRE_TIME});

    res.status(201).json({
        status: "Success",
        data: {
            user,
            token
        }
    });
})

export const updateLoggedUser = asyncHandler(async(req, res, next) => {
    const updateUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            email: req.body.email,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            profileImg: req.body.profileImg
        },
        {returnDocument :"after", runValidators: true}
    )

    res.status(200).json({
        data: {
            updateUser
        }
    })
})