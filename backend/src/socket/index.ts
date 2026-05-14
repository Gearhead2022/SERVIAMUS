import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_LAN_URL,
    ].filter(Boolean) as string[];

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
