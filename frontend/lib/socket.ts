import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_LAN_URL;

export const createSocket = () => {
    return io(SOCKET_URL!, {
        withCredentials: true, // use cookies instead
    });
};