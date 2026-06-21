import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";

// ============================
// helpers
// ============================

const generateAccessToken = (userId) =>
    jwt.sign(
        { userId },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE_TIME } // 15m
    );

const generateRefreshToken = (userId) =>
    jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME } // 7d
    );

const sendRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,  // مش ممكن يتوصله بـ JS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    });
};

const sendTokenResponse = async (res, user, statusCode) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // احفظ الـ refresh token في الـ DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // ابعت الـ refresh token في cookie
    sendRefreshTokenCookie(res, refreshToken);

    res.status(statusCode).json({
        status: "Success",
        data: {
            user,
            accessToken,
        },
    });
};

// ============================
// signup
// ============================
export const signup = asyncHandler(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: "coach",
    });

    await sendTokenResponse(res, user, 201);
});

// ============================
// login
// ============================
export const login = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    await sendTokenResponse(res, user, 200);
});

// ============================
// refresh token
// ============================
export const refreshToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return next(new AppError("No refresh token, please login again", 401));
    }
    
    // تحقق من الـ token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // جيب الـ user وتحقق إن الـ token في الـ DB
    const user = await User.findById(decoded.userId).select("+refreshToken +refreshTokenExpires");

    if (!user || user.refreshToken !== token) {
        return next(new AppError("Invalid refresh token, please login again", 401));
    }

    if (user.refreshTokenExpires < Date.now()) {
        return next(new AppError("Refresh token expired, please login again", 401));
    }
    
    // ✅ جنرت access token جديد بس
    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
        status: "Success",
        data: {
            accessToken: newAccessToken,
        }
    });
});

// ============================
// logout
// ============================
export const logout = asyncHandler(async (req, res, next) => {
    // امسح الـ refresh token من الـ DB
    await User.findByIdAndUpdate(req.user._id, {
        refreshToken: undefined,
        refreshTokenExpires: undefined,
    });

    // امسح الـ cookie
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({
        status: "Success",
        message: "Logged out successfully",
    });
});

// ============================
// protect
// ============================
export const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new AppError("You are not logged in, please login first", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
        return next(new AppError("The user that belong to this token no longer exists", 401));
    }

    if (currentUser.passwordChangedAt) {
        const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000);
        if (passChangedTimestamp > decoded.iat) {
            return next(new AppError("User recently changed his password, please login again", 401));
        }
    }

    req.user = currentUser;
    next();
});

// ============================
// allowedTo
// ============================
export const allowedTo = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You are not allowed to access this route", 403));
        }
        next();
    });
};

// ============================
// forgotPassword
// ============================
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError(`There is no user with this email ${req.body.email}`));
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");

    user.passwordResetCode = hashedResetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: "Your reset password",
            message: `
                <h2>TalentRadar</h2>
                <p>Hi ${user.name}</p>
                <p>Your reset password code is:</p>
                <h1>${resetCode}</h1>
                <p>This code is valid for 10 minutes.</p>
            `,
        });
    } catch (error) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;
        await user.save();

        return next(new AppError("There is an error in sending email", 500));
    }

    res.status(200).json({
        status: "success",
        message: "Reset code sent to email",
    });
});

// ============================
// verifyResetPassword
// ============================
export const verifyResetPassword = asyncHandler(async (req, res, next) => {
    const hashedResetCode = crypto
        .createHash("sha256")
        .update(req.body.resetCode)
        .digest("hex");

    const user = await User.findOne({
        passwordResetCode: hashedResetCode,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError("Reset code invalid or expired", 400));
    }

    user.passwordResetVerified = true;
    await user.save();

    res.status(200).json({ status: "success" });
});

// ============================
// resetPassword
// ============================
export const resetPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError(`There is no user with email ${req.body.email}`, 404));
    }

    if (!user.passwordResetVerified) {
        return next(new AppError("Reset password not verified", 400));
    }

    user.password = req.body.newPassword;
    user.passwordResetVerified = undefined;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    await sendTokenResponse(res, user, 200);
});

// ============================
// changeLoggedUserPass
// ============================
export const changeLoggedUserPass = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now(),
        },
        { returnDocument: "after", runValidators: true }
    );

    await sendTokenResponse(res, user, 200);
});
// ============================
// updateLoggedUser
// ============================
export const updateLoggedUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            email: req.body.email,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            profileImg: req.body.profileImg,
        },
        { returnDocument: "after", runValidators: true }
    );

    res.status(200).json({
        status: "Success",
        data: { user },
    });
});