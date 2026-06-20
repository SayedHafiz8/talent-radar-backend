import express from "express";

import ageRouter from "./routes/ageGroupRouter.js";
import AppError from "./utils/appError.js";
import globalError from "./middlewares/errorMiddleware.js";
import teamRouter from "./routes/teamrouter.js";
import playerRouter from "./routes/playerRouter.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter .js";
import scoutingRouter from "./routes/scoutingReportRouter.js";
import mediaRouter from "./routes/playerMediaRouter.js";


// Express Meddilware
const app = express();
app.use(express.json())

// ADDING ROUTES FOR APP
app.use('/api/v1/ages', ageRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/players', playerRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/reports', scoutingRouter);
app.use('/api/v1/media', mediaRouter)


// DEFULT ROUTE
app.use((req, res, next) => {
    next(new AppError(`Cannot find the resource '${req.originalUrl}' `, 404));
});

// Global Error Handeling
app.use(globalError);


export default app;