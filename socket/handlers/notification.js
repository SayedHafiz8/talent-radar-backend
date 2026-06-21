import { getIO, getConnectedUsers } from "../index.js";
import User from "../../models/userModel.js";

// ✅ بعت notification لـ user معين
export const sendNotificationToUser = (userId, notification) => {

    const io = getIO();

    const connectedUsers = getConnectedUsers();


    const sockets = connectedUsers.get(
        userId.toString()
    );


    if (!sockets) return;


    sockets.forEach(socketId => {

        io.to(socketId).emit(
            "notification",
            notification
        );

    });

};

// ✅ بعت notification لكل الـ admins
export const sendNotificationToAdmins = async (notification) => {

    const io = getIO();
    const connectedUsers = getConnectedUsers();


    const admins = await User
        .find({ role: "admin" })
        .select("_id");


    admins.forEach((admin) => {


        const sockets = connectedUsers.get(
            admin._id.toString()
        );


        if (!sockets) return;


        sockets.forEach(socketId => {

            io.to(socketId).emit(
                "notification",
                notification
            );

        });


    });
};