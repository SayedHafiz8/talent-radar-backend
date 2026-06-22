import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import ageRouter from "./routes/ageGroupRouter.js";
import AppError from "./utils/appError.js";
import globalError from "./middlewares/errorMiddleware.js";
import teamRouter from "./routes/teamrouter.js";
import playerRouter from "./routes/playerRouter.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter .js";
import dashboardRouter from "./routes/dashboardRouter.js";
import swaggerUi from "swagger-ui-express";
import specs from "./utils/swagger.js";




// Express Meddilware
const app = express();


// security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,          // مطلوب لإرسال refreshToken cookie من Angular
    optionsSuccessStatus: 200,  // لـ legacy browsers
}));

// General limiter — 100 request / 15 min
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: "error",
        message: "Too many requests, please try again later"
    }
});
app.use("/api", limiter);

// Auth limiter — 15 request / 15 min (يمنع brute force على login/signup)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
        status: "error",
        message: "Too many auth requests, please try again later"
    }
});
app.use("/api/v1/auth", authLimiter);

// Body parser
app.use(express.json())
app.use(cookieParser());

// ADDING ROUTES FOR APP
app.use('/api/v1/ages', ageRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/players', playerRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);

if (process.env.NODE_ENV !== "production") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}
// DEFULT ROUTE
app.use((req, res, next) => {
    next(new AppError(`Cannot find the resource '${req.originalUrl}' `, 404));
});

// Global Error Handeling
app.use(globalError);


export default app;