import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_LAN_URL;
let socket: Socket | null = null;

export const createSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL!, {
            autoConnect: true,
            withCredentials: true,
        });
    }

    return socket;
};
