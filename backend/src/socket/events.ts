import { RoleTypes } from "@prisma/client";
import { Server } from "socket.io";

export const registerSocketEvents = (io: Server) => {
    io.on("connection", (socket) => {
        const user = socket.data.user;

        // console.log("Connected user:", user.user_id);
        // console.log("User joined room:", `user_${user.user_id}`);

        socket.join(`user_${user.user_id}`);

        // join role room
        socket.join(`role_${user.role}`);

        console.log(`User ${user.id} connected`);

        user.roles.forEach((role: RoleTypes) => {
            socket.join(`role_${role}`);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected:", user.user_id);
        });
    });
};