import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const connectedUsers = new Map();

export const initSocket = (server) => {
    console.log("SOCKET INITIALIZED");

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  // ✅ Socket Authentication Middleware
  io.use(async (socket, next) => {
    console.log("SOCKET MIDDLEWARE HIT");

    try {
        const token =
            socket.handshake.auth.token ||
            socket.handshake.query.token;

        console.log("TOKEN:", token);


        if (!token) {
            console.log("NO TOKEN");
            return next(new Error("Unauthorized"));
        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );


        socket.userId = decoded.userId;

        console.log("AUTH USER:", socket.userId);

        next();

    } catch (err) {

        console.log("AUTH ERROR:", err.message);

        next(new Error("Unauthorized"));
    }
});



io.on("connection", (socket) => {

    console.log("🔥 CONNECTION EVENT");

    console.log("USER:", socket.userId);

    // باقي الكود

    console.log("Connected:", socket.userId);

    const userId = socket.userId.toString();

    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }

    connectedUsers.get(userId).add(socket.id);
    console.log([...connectedUsers]);

    socket.on("disconnect", () => {
      const userSockets = connectedUsers.get(userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
        }
      }

      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = () => io;

export const getConnectedUsers = () => connectedUsers;
