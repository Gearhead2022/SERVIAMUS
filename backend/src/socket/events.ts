import { Server } from "socket.io";

export const registerSocketEvents = (io: Server) => {
    io.on("connection", (socket) => {
        const user = socket.data.user;

        // console.log("Connected user:", user.user_id);
        // console.log("User joined room:", `user_${user.user_id}`);

        socket.join(`user_${user.user_id}`);
        user.roles.forEach((role: string) => {
            socket.join(`role_${role}`);
        });

        console.log(`User ${user.user_id} connected`);

        socket.on("disconnect", () => {
            console.log("Disconnected:", user.user_id);
        });
    });
};
