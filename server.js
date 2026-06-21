import dotenv from "dotenv";
dotenv.config({path: './config.env'})

// Handlling Syncronus Errors 
process.on('uncaughtException', (error) => {
    console.log(`${error.name}: ${error.message}`);
    console.log('Uncaughted Exception Occured, Shutting down...');
    process.exit(1);
});

import app from "./app.js";
import { dbConnection } from "./config/database.js";
import { createServer } from "http";           
import { initSocket } from "./socket/index.js"; 
import { startDailySummary } from "./socket/handlers/dailySummary.js";



const port = process.env.PORT;

dbConnection()

const server = createServer(app)
initSocket(server);
startDailySummary();

server.listen(port, () => {
    console.log("Server running 🚀");
});

server.timeout = 120000;

// Handlling Rejected Promises
process.on('unhandledRejection', (error) => {
    console.log(`${error.name}: ${error.message}`);
    console.log('Unhandled Rejection Occured, Shutting down...');

    server.close(() => {
        process.exit(1);
    })
})




