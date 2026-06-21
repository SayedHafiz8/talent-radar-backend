import { Server } from "socket.io";

let io;

// Map لحفظ الـ connected users
// { userId: socketId }
const connectedUsers = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        

        // الـ client بيبعت userId بعد الاتصال
        socket.on("register", (userId) => {
            connectedUsers.set(userId.toString(), socket.id);
            
        });

        socket.on("disconnect", () => {
            // امسح الـ user من الـ Map لما يتقطع
            for (const [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    console.log(`User disconnected: ${userId}`);
                    break;
                }
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
};

export const getConnectedUsers = () => connectedUsers;